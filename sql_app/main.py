# sql_app/main.py

import jwt
from jwt import PyJWTError
from fastapi import FastAPI, Depends, HTTPException  # type: ignore
from sqlalchemy.orm import Session
from . import security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm  # type: ignore
from .config import settings
# Import các thành phần từ các file khác trong cùng thư mục
from . import models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from .firebase_config import firebase_auth

# Tạo các bảng trong CSDL (nếu chúng chưa tồn tại)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CẤU HÌNH CORS ---
# Danh sách các nguồn được phép truy cập.
# Dùng ["*"] để cho phép tất cả, nhưng trong thực tế nên chỉ định rõ.
origins = [
    "http://localhost",
    "http://localhost:3000",  # Cổng mặc định cho React
    "http://localhost:8080",  # Cổng mặc định cho Vue
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Cho phép các nguồn trong danh sách
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, etc.)
    allow_headers=["*"],  # Cho phép tất cả các header
)

# Thêm dependency cho OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- Dependency ---
# Hàm này sẽ tạo ra một phiên làm việc (session) với CSDL cho mỗi request
# và tự động đóng nó lại khi request kết thúc.


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Path Operations ---





# --- DEPENDENCY ĐỂ LẤY NGƯỜI DÙNG HIỆN TẠI ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Dùng Firebase Admin SDK để xác thực ID Token
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Tìm user trong DB bằng uid, nếu chưa có thì tạo mới
        user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
        if not user:
            # Nếu muốn tự động tạo user trong DB khi họ đăng nhập lần đầu
            user = models.User(firebase_uid=uid, username=decoded_token.get('email') or uid)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- BẢO VỆ ENDPOINT CREATE_TODO ---


@app.post("/todos/", response_model=schemas.TodoBase)
def create_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user)  # Thêm dependency này
):
    # Tạo todo và gán owner_id là id của người dùng hiện tại
    db_todo = models.Todo(task=todo.task, owner_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


# @app.get("/todos/", response_model=list[schemas.TodoBase])
# def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
#                current_user: models.User = Depends(get_current_user)):
#     todos = db.query(models.Todo).offset(skip).limit(limit).all()
#     return todos

@app.get("/todos/", response_model=list[schemas.TodoBase])
def read_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # <-- THÊM DÒNG NÀY
):
    # Bây giờ bạn thậm chí có thể lọc các công việc theo người dùng đã đăng nhập!
    todos = db.query(models.Todo).filter(models.Todo.owner_id ==
                                         current_user.id).offset(skip).limit(limit).all()
    return todos


@app.get("/todos/{todo_id}", response_model=schemas.TodoBase)
def read_todo(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo


@app.put("/todos/{todo_id}", response_model=schemas.TodoBase)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    # Cập nhật các trường cần thiết
    for key, value in todo.dict(exclude_unset=True).items():
        setattr(db_todo, key, value)

    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}", response_model=schemas.TodoBase)
def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(db_todo)
    db.commit()
    return db_todo
