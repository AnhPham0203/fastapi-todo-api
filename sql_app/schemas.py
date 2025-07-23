# sql_app/schemas.py

from pydantic import BaseModel

# Schema cho việc tạo một Todo (dữ liệu đầu vào)
class TodoCreate(BaseModel):
    task: str

# Schema cho việc cập nhật một Todo (dữ liệu đầu vào)
class TodoUpdate(BaseModel):
    task: str | None = None
    completed: bool | None = None

# Schema cơ bản để trả về dữ liệu (dữ liệu đầu ra)
class TodoBase(BaseModel):
    id: int
    task: str
    completed: bool
    owner_id: int

    # Cấu hình này cho phép Pydantic đọc dữ liệu từ các đối tượng ORM
    class Config:
        orm_mode = True
        
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    
    class Config:
        orm_mode = True