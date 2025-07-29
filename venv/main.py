# main.py

# 1. Import class FastAPI
from fastapi import FastAPI
from pydantic import BaseModel
import random
# 2. Tạo một instance của FastAPI
app = FastAPI()

quotes = [
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "The way to get started is to quit talking and begin doing.",
    "Life is what happens when you're busy making other plans.",
    "Your time is limited, so don't waste it living someone else's life.",  
    "If life were predictable it would cease to be life, and be without flavor.",
    "If you look at what you have in life, you'll always have more.",
]

class TodoCreate(BaseModel):
    # Client PHẢI gửi lên một trường 'task' và nó PHẢI là một chuỗi.
    task: str
    # Client CÓ THỂ gửi lên một trường 'completed', nó PHẢI là boolean,
    # và nếu không gửi, giá trị mặc định sẽ là False.
    completed: bool = False

class Item(BaseModel):
    # Đây là một ví dụ về cách định nghĩa một model khác.
    name: str
    description: str | None = None  # Có thể là None hoặc một chuỗi
    price : float
    tax: float | None = None  # Có thể là None hoặc một số thực
   
@app.post("/items/")
async def create_item(item: Item):
    
    print("Received new item:", item.name, item.description, item.price, item.tax)
    
    # Trả về dữ liệu đã được xác thực
    return {"message": "Item created successfully", "data": item}


@app.post("/todos")
async def create_todo(todo: TodoCreate):
    # FastAPI sẽ tự động:
    # 1. Đọc request body.
    # 2. Chuyển JSON thành một đối tượng của class TodoCreate.
    # 3. Xác thực dữ liệu:
    #    - Nếu thiếu 'task' -> Lỗi.
    #    - Nếu 'task' không phải là string -> Lỗi.
    #    - Nếu 'completed' không phải là boolean -> Lỗi.
    # 4. Nếu mọi thứ hợp lệ, bạn có thể truy cập dữ liệu như một đối tượng:
    #    todo.task
    #    todo.completed
    
    # In ra để xem
    print("Received new todo:", todo.task, todo.completed)
   
    
    # Trả về dữ liệu đã được xác thực
    return {"message": "Todo created successfully", "data": todo}


    
# 3. Định nghĩa một "path operation decorator"
#    @app.get("/") tương đương với @app.route('/', methods=['GET']) trong Flask
#    FastAPI tách biệt các phương thức HTTP thành các decorator riêng:
#    @app.get(), @app.post(), @app.put(), @app.delete()
@app.get("/")
async def read_root():
    # "async" cho phép xử lý bất đồng bộ, chúng ta sẽ tìm hiểu sau.
    # Bạn có thể dùng "def read_root():" cũng được.
    # FastAPI đủ thông minh để tự động chuyển đổi dictionary thành JSON.
    return {"message": "Hello, FastAPI World!"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    # Đây là ví dụ về sức mạnh của FastAPI:
    # - item_id: int -> Tự động xác thực là số nguyên.
    # - q: str | None = None -> Một query parameter tùy chọn tên là 'q'.
    return {"item_id": item_id, "q": q}

@app.get("/api/quote")
async def get_quote():
    # Trả về một câu trích dẫn ngẫu nhiên từ danh sách quotes.
    quote = random.choice(quotes)
    return {"quote": quote}