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


@app.post("/users/register", response_model=schemas.UserInDB)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra xem username đã tồn tại chưa
    db_user = db.query(models.User).filter(
        models.User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=400, detail="Username already registered")

    # Băm mật khẩu trước khi lưu
    hashed_password = security.get_password_hash(user.password)

    # Tạo đối tượng User mới
    db_user = models.User(username=user.username,
                          hashed_password=hashed_password)

    # Lưu vào CSDL
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@app.post("/users/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Tìm user
    user = db.query(models.User).filter(
        models.User.username == form_data.username).first()
    # Xác thực
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,  # Unauthorized
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Tạo token
    access_token = security.create_access_token(
        data={"sub": user.username, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- DEPENDENCY ĐỂ LẤY NGƯỜI DÙNG HIỆN TẠI ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

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
