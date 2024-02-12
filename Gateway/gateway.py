from fastapi import FastAPI, Response, Header, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import grpc
import idm_pb2
import idm_pb2_grpc
import time
from models import *
import requests
from authorization_utils import *
import ast

app = FastAPI()

channel = grpc.insecure_channel('localhost:50051')

stub = idm_pb2_grpc.AuthenticationServiceStub(channel)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"],)

patients_service_url = "http://localhost:8082/api/medical_office/patients"
physicians_service_url = "http://localhost:8082/api/medical_office/physicians"
consultatii_service_url = "http://localhost:8090/api/medical_office/consultatii"

@app.post('/api/register_patient', response_model=RegisterResponse)
async def register_patient(user_request: RegisterPatientRequest, response: Response):
    user = idm_pb2.RegisterRequest(username=user_request.username, password=user_request.password, email=user_request.email, role="PATIENT")
    grpc_response = stub.Register(user)
    res = None
    if grpc_response.succes == False:
        response.status_code = 409
        return {"response": grpc_response.message}
    else:
        if grpc_response.user_id != -1:
            res = requests.post(patients_service_url, json= {
                "id_user": grpc_response.user_id,
                "cnp": user_request.cnp,
                "lastname": user_request.lastname,
                "firstname": user_request.firstname,
                "email": user_request.email,
                "phone": user_request.phone,
                "birth_date": user_request.birth_date,
                "is_active": user_request.is_active
            }).json()
            print(res)
        else:
            response.status_code = 409
            return {"response": "User ID not valid!"}
    return {"response": grpc_response.message + " Patient registered!"}

@app.post('/api/register_doctor', response_model=RegisterResponse)
async def register_doctor(user_request: RegisterDoctorRequest, response: Response, authorization: str = Header(None)):
    print(authorization)
    print(is_admin(stub, authorization))
    if not is_admin(stub, authorization):
        raise HTTPException(status_code=405, detail="Method Not Allowed")

    user = idm_pb2.RegisterRequest(username=user_request.username, password=user_request.password, email=user_request.email, role="DOCTOR")
    grpc_response = stub.Register(user)
    res = None
    if grpc_response.succes == False:
        response.status_code = 409
        return {"response": grpc_response.message}
    else:
        if grpc_response.user_id != -1:
            res = requests.post(physicians_service_url, json= {
                "id_user": grpc_response.user_id,
                "lastname": user_request.lastname,
                "firstname": user_request.firstname,
                "email": user_request.email,
                "phone": user_request.phone,
                "specialization": user_request.specialization
            }).json()
            print(res)
        else:
            response.status_code = 409
            return {"response": "User ID not valid!"}
    return {"response": grpc_response.message + " Doctor registered!"}    

@app.post('/api/register_admin', response_model=RegisterResponse)
async def register_admin(user_request: RegisterAdminRequest, response: Response, authorization: str = Header(None)):
    if not is_admin(stub, authorization):
        raise HTTPException(status_code=405, detail="Method Not Allowed")

    user = idm_pb2.RegisterRequest(username=user_request.username, password=user_request.password, email=user_request.email, role="ADMIN")
    grpc_response = stub.Register(user)
    res = None
    if grpc_response.succes == False:
        response.status_code = 409
        return {"response": grpc_response.message}

    return {"response": grpc_response.message}      

@app.post('/api/login', response_model=LoginResponse)
async def login(user_request: LoginRequest, response: Response):
    user = idm_pb2.AuthenticationRequest(username=user_request.username, password=user_request.password)
    grpc_response = stub.Authenticate(user)
    
    print(grpc_response)
    if grpc_response.succes == False:
        response.status_code = 401
        return {"response": grpc_response.jwt_token}
    response.headers["Authorization"] = f"Bearer {grpc_response.jwt_token}"
    return { 
            "response": "Authentication successful!",
            "jwt_token": grpc_response.jwt_token
           }

@app.delete('/api/delete/{id}', response_model=DeleteResponse)
async def delete(id: int, response: Response, authorization: str = Header(None)):
    if not is_admin(stub, authorization):
        raise HTTPException(status_code=405, detail="Method Not Allowed")
    user = idm_pb2.DeleteRequest(id=id)
    grpc_response = stub.Delete(user)
    
    print(grpc_response)
    if grpc_response.succes == False:
        response.status_code = 400

    return { "response": grpc_response.message }

@app.get('/api/admins', response_model=UsersResponse)
async def users(user_request: Request, response: Response, authorization: str = Header(None)):
    if not is_admin(stub, authorization):
        raise HTTPException(status_code=405, detail="Method Not Allowed")
    user= idm_pb2.UsersRequest(role="ADMIN")
    grpc_response = stub.GetUsers(user)
    
    print(grpc_response.message)
    if grpc_response.succes == False:
        response.status_code = 400
    data_list = ast.literal_eval(grpc_response.message)
    return { "response": data_list }


def forward_request(response, request_method: str, url: str, headers: dict, params=None, data=None, json=None, info = None):
    # print(json)
    # print(url)
    res = requests.request(method=request_method, url=url, headers=headers,
                                params=params, data=data, json=json)
    response.status_code = res.status_code
    print(res)
    if res and request_method in ['GET', 'PUT']:
        if info == 'patient':
            json_data = res.json()
            for item in json_data:
                print(f"{physicians_service_url}/{item['id_doctor']}")
                res1 = requests.get(f"{physicians_service_url}/{item['id_doctor']}")
                print(res1)
                if res1.status_code == 200:
                    res1_json = res1.json()
                    print(res1_json)
                    item['doctor_name'] = res1_json['lastname'] + " " + res1_json['firstname']
            return json_data
        elif info == 'doctor':
            json_data = res.json()
            for item in json_data:
                print(f"{physicians_service_url}/{item['cnp_patient']}")
                res1 = requests.get(f"{patients_service_url}/{item['cnp_patient']}")
                print(res1)
                if res1.status_code == 200:
                    res1_json = res1.json()
                    print(res1_json)
                    item['patient_name'] = res1_json['lastname'] + " " + res1_json['firstname']
            return json_data
            
        return res.json()
    json = None
    try:
        json = res.json()
        return json
    except:
        return res


@app.get('/api/medical_office/patients')
async def get_patients(request: Request, response: Response, authorization: str = Header(None), is_active: bool = None):
    #check if it is doctor, or if the query parameter is active, so the doctor can see the active patients
    if not is_admin(stub, authorization) and ((not is_doctor(stub, authorization)) or (is_doctor(stub, authorization) and is_active == None)):
        raise HTTPException(status_code=405, detail="Method Not Allowed")
    print(patients_service_url)
    res = requests.get(patients_service_url, params=request.query_params)
    response.status_code = res.status_code
    if res:
        response.status_code = res.status_code
        return res.json()
    return res

@app.get('/api/medical_office/physicians')
async def get_physicians(request: Request, response: Response, authorization: str = Header(None)):
    if not is_admin(stub, authorization) and not is_patient(stub, authorization):
        raise HTTPException(status_code=405, detail="Method Not Allowed")
    res = requests.get(physicians_service_url)

    
    if res:
        response.status_code = res.status_code
        return res.json()
    return res
 
@app.api_route("/api/medical_office/patients/{path:path}", methods=["GET", "PUT", "DELETE"])
async def users(path: str, request: Request, response: Response, authorization: str = Header(None)):
    role_id = path.split('/')[0]
    print(role_id)

    result = check_token(stub, authorization, role_id)

    print(result)
    if not result:
        raise HTTPException(status_code=403, detail="Access forbidden!")
 
    headers_to_forward = dict(request.headers)
    del [headers_to_forward['authorization'], headers_to_forward['host']]
 
    url = f"{patients_service_url}/{path}"

    info = None
    if request.method in ["GET"] and 'physicians' in path:
        info = 'patient'


    #delete patient
    if request.method in ["DELETE"] and 'physicians' not in path:
        if not is_admin(stub, authorization):
            raise HTTPException(status_code=403, detail="Access forbidden!")
        else:
            patient = requests.get(url)
            if patient.status_code == 200:
                res = forward_request(response, request.method, url, headers_to_forward)
                if res and res.status_code == 204:
                    delete_res = idm_pb2.DeleteRequest(id=int(patient.json()['id_user']))
                    grpc_response =  stub.Delete(delete_res)
                    if grpc_response.succes == False:
                        raise HTTPException(status_code=409, detail="Deletion was not successful!")
                    return res
                else:
                    raise HTTPException(status_code=404, detail="Deletion was not successful!")
            raise HTTPException(status_code=404, detail="Patient not found!")
        

    #get or delete appointment
    if request.method in ["GET", "DELETE"]:
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params, info=info)
    #update
    elif request.method in ["PUT"]:
        body = await request.json()
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params, json=body, info=info)
 
    else:
        raise HTTPException(status_code=405, detail="Method Not Allowed")

@app.api_route("/api/medical_office/physicians/{path:path}", methods=["GET", "PUT", "DELETE"])
async def users(path: str, request: Request, response: Response, authorization: str = Header(None)):
    role_id = path.split('/')[0]
    print(role_id)
 
    result = check_token(stub, authorization, role_id)

    print(result)
    if not result:
        raise HTTPException(status_code=403, detail="Access forbidden!")
 
    headers_to_forward = dict(request.headers)
    del [headers_to_forward['authorization'], headers_to_forward['host']]
 
    url = f"{physicians_service_url}/{path}"

    info = None
    if request.method in ["GET"] and 'patients' in path:
        info = 'doctor'

    #delete patient
    if request.method in ["DELETE"] and 'patients' not in path:
        if not is_admin(stub, authorization):
            raise HTTPException(status_code=403, detail="Access forbidden!")
        else:
            doctor = requests.get(url)
            if doctor.status_code == 200:

                res = forward_request(response, request.method, url, headers_to_forward)
                if res and res.status_code == 204:
                    delete_res = idm_pb2.DeleteRequest(id=int(doctor.json()['id_user']))
                    grpc_response =  stub.Delete(delete_res)
                    if grpc_response.succes == False:
                        raise HTTPException(status_code=409, detail="Deletion was not successful!")
                    return res
                else:
                    raise HTTPException(status_code=404, detail="Deletion was not successful!")
            raise HTTPException(status_code=404, detail="Doctor not found!")
        

    #get or delete appointment
    if request.method in ["GET", "DELETE"]:
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params, info=info)
    #update
    elif request.method in ["PUT"]:
        body = await request.json()
        # print(body)
        # print(request)
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params, json=body, info=info)
 
    else:
        raise HTTPException(status_code=405, detail="Method Not Allowed")

@app.api_route("/api/medical_office/appointments", methods=["GET", "PUT"])
async def appointments(request: Request, response: Response, authorization: str = Header(None), id: int = None, cnp: str = None):
    result = None
    if cnp != None:
        result = check_token(stub, authorization, cnp)
    elif id != None:
        result = check_token(stub, authorization, id)
    else:
        result = decode_access_token(stub, authorization)

    print(result)
    if result != None and not result:
        raise HTTPException(status_code=403, detail="Access forbidden!")
 
    headers_to_forward = dict(request.headers)
    del [headers_to_forward['authorization'], headers_to_forward['host']]
 
    url = appointments_service_url      

    if request.method in ["GET"]:
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params)
    elif request.method in ["PUT"]:
        payload = decode_access_token(stub, authorization)
        body = await request.json()
        print(body)
        print(body['id_doctor'])
        print(body['cnp_patient'])
        print(payload)
        if payload['role_id'] == str(body['cnp_patient']) or payload['role_id'] == str(body['id_doctor']):
            return forward_request(response, request.method, url, headers_to_forward, json=body)
        else:
            raise HTTPException(status_code=405, detail="Method Not Allowed")
    else:
        raise HTTPException(status_code=405, detail="Method Not Allowed")

@app.api_route("/api/medical_office/consultatii{path:path}", methods=["GET", "PUT", "DELETE", "POST"])
async def appointment(request: Request, response: Response, authorization: str = Header(None), path: str = None):
    print(authorization)

    if request.method in ["POST", "PUT", "DELETE"]:
        if not is_doctor(stub, authorization):
            raise HTTPException(status_code=405, detail="Method Not Allowed")
 
    headers_to_forward = dict(request.headers)
    del [headers_to_forward['authorization'], headers_to_forward['host']]
    print(path)
    url = ""
    if path != None and path != "":
        url = f"{consultatii_service_url}{path}" 
    else:
        url = consultatii_service_url
    print(url)

  

    if request.method in ["GET", "DELETE"]:
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params)
    elif request.method in ["PUT", "POST"]:
        body = await request.json()
        # print(body)
        return forward_request(response, request.method, url, headers_to_forward, params=request.query_params, json=body)
    else:
        raise HTTPException(status_code=405, detail="Method Not Allowed")
