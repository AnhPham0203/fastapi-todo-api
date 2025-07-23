# sql_app/security.py

import datetime
import jwt
from passlib.context import CryptContext
from .config import settings

# 1. Tạo một context để băm mật khẩu, nói cho nó biết thuật toán mặc định là bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Hàm để xác thực mật khẩu
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3. Hàm để băm mật khẩu
def get_password_hash(password):
    return pwd_context.hash(password)

# --- THÊM CÁC HÀM VÀ BIẾN CHO JWT ---
# Khóa bí mật để ký JWT. Trong thực tế, đây phải là một chuỗi phức tạp và được lưu an toàn.
# SECRET_KEY = "your-super-secret-key-for-jwt"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hàm để tạo Access Token
def create_access_token(data: dict):
    to_encode = data.copy()
    # Thêm thời gian hết hạn vào token
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Tạo JWT
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
