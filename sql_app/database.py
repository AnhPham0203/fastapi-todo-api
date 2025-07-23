# sql_app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Định nghĩa URL của CSDL SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# 2. Tạo SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
# Ghi chú: connect_args={"check_same_thread": False} chỉ cần cho SQLite.

# 3. Tạo một lớp SessionLocal
# Mỗi instance của lớp này sẽ là một phiên làm việc với CSDL.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Tạo một lớp Base
# Các class model của chúng ta sẽ kế thừa từ lớp này.
Base = declarative_base()