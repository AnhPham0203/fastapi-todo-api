
 # sql_app/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
     SECRET_KEY: str
     ALGORITHM: str
     ACCESS_TOKEN_EXPIRE_MINUTES: int

     class Config:
         # Dòng này sẽ bảo Pydantic đọc các biến từ file .env
         env_file = ".env"

 # Tạo một instance của Settings để có thể import và sử dụng ở nơi khác
settings = Settings()
