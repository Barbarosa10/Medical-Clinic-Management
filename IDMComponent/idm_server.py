import grpc
from concurrent import futures
import time 
import idm_pb2
import idm_pb2_grpc
from database import db
from jose import jwt, JWTError
import time
import pytz

SECRET_KEY = 'secret'
black_list = []

class Server(idm_pb2_grpc.AuthenticationServiceServicer):
    def Register(self, request, context):
        response = idm_pb2.RegisterResponse()

        response.succes = db.register(request.username, request.password, request.email, request.role)
        if response.succes:
            response.message = 'User was registered!'
            user_id = db.get_user_id(request.username)
            response.user_id = user_id
        else:
            response.message = 'User was not registered!'
        print(response)
        return response

    def Delete(self, request, context):
        response = idm_pb2.DeleteResponse()

        response.succes = db.delete(request.id)
        if response.succes:
            response.message = 'User was deleted!'
        else:
            response.message = 'User was not deleted!'

        print(response)
        return response

    def Authenticate(self, request, context):
        response = idm_pb2.AuthenticationResponse()

        user = db.login(request.username, request.password)

        if user:
            user_id = None
            if user[3] == 'PATIENT':
                user_id = db.get_patient_id(user[0])
            elif user[3] == 'DOCTOR':
                user_id = db.get_doctor_id(user[0])
            if user[3] == 'ADMIN' or user_id:
                response.succes = True
                payload_data = {
                    'sub': str(user[0]),
                    'role_id': str(user_id),
                    'name': str(user[1]),
                    'role': str(user[3]),
                    'iat': int(time.time()),
                    'exp': int(time.time()) + 7200
                }
                print(payload_data)
                jwt_token = jwt.encode(
                    payload_data,
                    SECRET_KEY,
                    algorithm='HS256'
                )

                response.jwt_token = jwt_token
                print(jwt_token)
            else:
                response.jwt_token = "Couldn't get user id!"
                response.succes = False

        else:
            response.jwt_token = "Invalid credentials!"
            response.succes = False
            
        return response

    def GetUsers(self, request, context):
        response = idm_pb2.UsersResponse()

        users = db.get_users(request.role)

        if users:
                response.succes = True
                response.message = str(users)

        else:
            response.message = "No users found"
            response.succes = False
            
        return response

    def ValidateJWT(self, request, context):
        response = idm_pb2.ValidateJWTResponse()
        jwt_token = str(request.jwt_token)
        if jwt_token in black_list:
            response.is_valid = False
            response.message = "JWT is not valid!" 
            return response

        try:
            print(jwt_token)
            decoded_payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
            print(decoded_payload)
            response.is_valid = True
            response.message = str(decoded_payload)
            response.sub = decoded_payload['sub']
            response.role = decoded_payload['role']
            response.role_id = decoded_payload['role_id']
            return response

        except JWTError as e:
            print(f"JWT validation failed: {e}")
            response.is_valid = False
            response.message = f"JWT validation failed: {e}"
            return response

    def InvalidateJWT(self, request, context):
        black_list.append(request.jwt_token)
        print(f"invalidate JWT: {request.jwt_token}")

        response = idm_pb2.InvalidateJWTResponse()
        response.message = "JWT token was invalidated!"
        return response

    def ChangePassword(self, request, context):
        response = idm_pb2.ChangePasswordResponse()
        succes = db.change_password(request.username, request.old_password, request.new_password)
        if succes:
            response.message = "Password was changed successfully!"
        else:
            response.message = "Password could not be updated!"

        return response          

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
idm_pb2_grpc.add_AuthenticationServiceServicer_to_server(Server(), server)

print('Starting server. Listening on port 50051.')
server.add_insecure_port('[::]:50051')
server.start()

try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)