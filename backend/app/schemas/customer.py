from pydantic import BaseModel, Field, EmailStr, ConfigDict


class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r"^\d{7,15}$")


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    model_config = ConfigDict(from_attributes=True)
