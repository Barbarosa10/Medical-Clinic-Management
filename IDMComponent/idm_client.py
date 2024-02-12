import grpc
import idm_pb2
import idm_pb2_grpc
import time

channel = grpc.insecure_channel('localhost:50051')

stub = idm_pb2_grpc.AuthenticationServiceStub(channel)

user = idm_pb2.RegisterRequest(username="danut", password="parola", email="danut@gmail.com", role="ADMIN")
response = stub.Register(user)
print(response)

# user = idm_pb2.AuthenticationRequest(username="emi", password="parola")
# response = stub.Authenticate(user)
# print(response)

# jwt_token = response.jwt_token
# print(jwt_token)
# user = idm_pb2.ValidateJWTRequest(jwt_token=jwt_token)
# response = stub.ValidateJWT(user)
# print(response)

# user = idm_pb2.ChangePasswordRequest(username="danut", old_password="parola1", new_password="parola")
# response = stub.ChangePassword(user)
# print(response)

# time.sleep(6)

# user = idm_pb2.ValidateJWTRequest(jwt_token=jwt_token)
# response = stub.ValidateJWT(user)
# print(response)

# user = idm_pb2.InvalidateJWTRequest(jwt_token=jwt_token)
# response = stub.InvalidateJWT(user)
# print(response)

# user = idm_pb2.ValidateJWTRequest(jwt_token=jwt_token)
# response = stub.ValidateJWT(user)
# print(response)