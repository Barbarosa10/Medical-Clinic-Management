from pydantic import BaseModel

class RegisterPatientRequest(BaseModel):
    username: str
    password: str
    email: str
    cnp: str
    lastname: str
    firstname: str
    phone: str
    birth_date: str
    is_active: int

class RegisterDoctorRequest(BaseModel):
    username: str
    password: str
    email: str
    specialization: str
    lastname: str
    firstname: str
    phone: str

class RegisterAdminRequest(BaseModel):
    username: str
    password: str
    email: str


class RegisterResponse(BaseModel):
    response: str

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    response: str | None = None
    jwt_token: str | None = None

class PatientResponse(BaseModel):
    cnp: str | None
    id_user: int | None
    lastname: str | None
    firstname: str | None
    phone: str | None
    birth_date: str | None
    is_active: bool | None

class UsersResponse(BaseModel):
    response: list | None = None

class DeleteResponse(BaseModel):
    response: str | None = None


