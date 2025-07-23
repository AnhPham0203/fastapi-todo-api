# Bước 1: Chọn một "Image nền" (base image).
# Chúng ta sẽ dùng một image chính thức của Python.
# Phiên bản "slim" nhẹ hơn phiên bản đầy đủ.
FROM python:3.11-slim

# Bước 2: Đặt thư mục làm việc bên trong container.
# Tất cả các lệnh sau sẽ được thực thi trong thư mục này.
WORKDIR /app

# Bước 3: Sao chép file requirements vào trong container.
# Chỉ sao chép file này trước để tận dụng cơ chế caching của Docker.
COPY requirements.txt .

# Bước 4: Cài đặt các thư viện từ file requirements.
RUN pip install --no-cache-dir -r requirements.txt

# Bước 5: Sao chép toàn bộ code của ứng dụng (thư mục sql_app) vào container.
COPY ./sql_app /app/sql_app

# Bước 6: Mở cổng (port) 8000 để thế giới bên ngoài có thể truy cập vào.
EXPOSE 8000

# Bước 7: Lệnh sẽ được chạy khi container khởi động.
# Chạy server uvicorn.
# --host 0.0.0.0 để server lắng nghe trên tất cả các network interface.
CMD ["uvicorn", "sql_app.main:app", "--host", "0.0.0.0", "--port", "8000"]