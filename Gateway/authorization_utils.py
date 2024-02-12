from fastapi import HTTPException
import idm_pb2
import idm_pb2_grpc

def decode_access_token(stub, authorization: str = None):
    print(authorization)
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authentication header missing")
    
    jwt_token =authorization.split(" ")[1] if authorization.startswith("Bearer ") else None
    if jwt_token is None:
        raise HTTPException(status_code=401, detail="Bearer token missing")

    jwt = idm_pb2.ValidateJWTRequest(jwt_token=str(jwt_token))
    grpc_response = stub.ValidateJWT(jwt)

    if not grpc_response.is_valid:
        raise HTTPException(status_code=401, detail="Token is invalid. Unauthorized!")

    return {"sub":grpc_response.sub, "role":grpc_response.role, "role_id":grpc_response.role_id}

def is_patient(stub, authorization: str = None):
    res = decode_access_token(stub, authorization)
    if res['role'] == 'PATIENT':
        return True
    return False

def is_doctor(stub, authorization: str = None):
    res = decode_access_token(stub, authorization)
    if res['role'] == 'DOCTOR':
        return True
    return False


def is_admin(stub, authorization: str = None):
    print(authorization)
    res = decode_access_token(stub, authorization)
    if res['role'] == 'ADMIN':
        return True
    return False



def check_token(stub, token, role_id = None, info=False):
    if info == False:
        payload = decode_access_token(stub, token)
        if payload['role_id'] == role_id or payload['role'] == "ADMIN":
            return True


    return False