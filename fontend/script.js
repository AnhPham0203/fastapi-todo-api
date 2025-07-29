// Bài 1 (Dễ / Easy): Khai báo biến
const PI = 3.14159;
let radius = 20;
let area = PI * radius * radius;
console.log(`The area of the circle with radius ${radius} is ${area}.`);

// Bài 2 (Trung bình / Medium): Chuyển đổi hàm
function greet(name) {
  return `Hello, ${name}!`;
}

function calculateAge(birthYear) {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

console.log(greet("Alice"));
console.log(`Alice is ${calculateAge(1990)} years old.`);

// Bài 3 (Thử thách / Challenge): Xử lý mảng với Arrow Function
const numbers = [1, 2, 3, 4, 5, 7];
const squaredNumbers = numbers.map((num) => num * num);
console.log(`Squared numbers: ${squaredNumbers.join(", ")}`);

const evenNumbers = numbers.filter((num) => num % 2 === 0);
console.log(`Even numbers: ${evenNumbers.join(", ")}`);

// script.js

// 1. Định nghĩa một hàm async để chứa logic gọi API
async function getSampleTodo() {
  console.log("Bắt đầu gọi API...");

  // 2. Dùng khối try...catch để xử lý lỗi (rất quan trọng!)
  try {
    // 3. Dùng await để chờ fetch hoàn thành.
    //    fetch() trả về một đối tượng Response, chưa phải là dữ liệu JSON.
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/111"
    );

    // 4. Kiểm tra xem request có thành công không (status code 200-299)
    if (!response.ok) {
      // Nếu không, ném ra một lỗi để khối catch bắt được
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 5. Dùng await để chờ việc chuyển đổi response thành JSON hoàn thành.
    const data = await response.json();

    // 6. Bây giờ chúng ta đã có dữ liệu!
    console.log("Đã nhận được dữ liệu:", data);

    // 7. Hiển thị dữ liệu lên trang web
    const resultElement = document.getElementById("result");
    resultElement.textContent = `Todo Title: ${data.title}`;
  } catch (error) {
    // 8. Nếu có bất kỳ lỗi nào xảy ra trong khối try, nó sẽ được bắt ở đây.
    console.error("Không thể lấy dữ liệu:", error);
    const resultElement = document.getElementById("result");
    resultElement.textContent = "Failed to load data.";
  }
}

// 9. Gọi hàm để nó thực thi
getSampleTodo();

async function getNewquote() {
  console.log("Bắt đầu gọi API https://api.quotable.io/random...");
  try {
    const response = await fetch("https://api.quotable.io/random");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Đã nhận được dữ liệu:", data);

    const resultElement = document.getElementById("result");
    resultElement.textContent = `Quote: ${data.content} - Author: ${data.author}`;
  } catch (error) {
    console.error("Không thể lấy dữ liệu:", error);
    const resultElement = document.getElementById("result");
    resultElement.textContent = "Failed to load quote.";
  }
}
// Gọi hàm để thực thi
getNewquote();

// Bài 2 (Trung bình / Medium): Hiển thị danh sách người dùng
// Viết một hàm async tên là fetchUsers.
// Gọi đến API: https://jsonplaceholder.typicode.com/users. API này sẽ trả về một mảng các đối tượng người dùng.
// Lấy phần tử HTML có id="result".
// Xóa nội dung cũ của phần tử result (result.innerHTML = '';).
// Duyệt qua mảng người dùng bạn nhận được. Với mỗi người dùng, hãy tạo một thẻ <p> mới chứa tên (user.name) và email (user.email) của họ, sau đó thêm thẻ <p> này vào bên trong phần tử result.

async function fetchUsers() {
  console.log("Bắt đầu gọi API để lấy danh sách người dùng...");
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log("Đã nhận được dữ liệu người dùng:", users);

    const resultElement = document.getElementById("result");
    resultElement.innerHTML = ""; // Xóa nội dung cũ
    users.forEach((user) => {
      const userElement = document.createElement("p");
      userElement.textContent = `Name: ${user.name}, Email: ${user.email}`;
      resultElement.appendChild(userElement);
    });
  } catch (error) {
    console.error("Không thể lấy dữ liệu người dùng:", error);
    const resultElement = document.getElementById("result");
    resultElement.textContent = "Failed to load users.";
  }
}
// Gọi hàm để thực thi
// fetchUsers();

// =================================================================
// PHẦN LOGIC XÁC THỰC VÀ GỌI API CÓ BẢO VỆ
// =================================================================

const API_BASE_URL = "https://fastapi-todo-app-xs0i.onrender.com";

/**
 * Gọi API để đăng nhập, lấy token và lưu vào localStorage.
 * @param {string} username
 * @param {string} password
 * @returns {string|null} Access token nếu thành công, null nếu thất bại.
 */
async function loginAndGetToken(username, password) {
  console.log(`Đang thử đăng nhập cho: ${username}`);
  // FormData đặc biệt cần thiết cho OAuth2PasswordRequestForm của FastAPI
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        // Khi dùng FormData, header này phải là 'application/x-www-form-urlencoded'
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Sai tên đăng nhập hoặc mật khẩu.");
    }

    const token = data.access_token;
    if (token) {
      // Lưu token vào localStorage để tái sử dụng
      localStorage.setItem("api_token", token);
      console.log("Đăng nhập thành công, token đã được lưu!");
      return token;
    } else {
      throw new Error("Không nhận được token từ server.");
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    alert(`Đăng nhập thất bại: ${error.message}`);
    return null;
  }
}

/**
 * Lấy danh sách công việc (todos) của người dùng đã đăng nhập.
 * Tự động đọc token từ localStorage.
 */
async function fetchMyTodos() {
  // Lấy token đã lưu từ localStorage
  const token = localStorage.getItem("api_token");

  if (!token) {
    alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem công việc.");
    console.error("Không tìm thấy token trong localStorage.");
    return;
  }

  console.log("Đang lấy danh sách công việc với token đã lưu...");

  try {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Lỗi Unauthorized, có thể token đã hết hạn
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("api_token"); // Xóa token cũ
      return;
    }

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }

    const myTodos = await response.json();
    console.log("Các công việc của bạn:", myTodos);

    // Hiển thị kết quả lên trang
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = "<h3>Công việc của bạn:</h3>"; // Xóa nội dung cũ và thêm tiêu đề
    myTodos.forEach((todo) => {
      const todoElement = document.createElement("p");
      todoElement.textContent = `- ${todo.task}`;
      resultElement.appendChild(todoElement);
    });
  } catch (error) {
    console.error("Không thể lấy dữ liệu công việc:", error);
    alert("Không thể lấy dữ liệu công việc. Xem console để biết chi tiết.");
  }
}

// --- CÁCH SỬ DỤNG ---
// Để sử dụng các hàm trên, bạn cần có form HTML cho người dùng nhập username/password
// và một nút để kích hoạt.

// Ví dụ về luồng sử dụng:
async function handleLoginAndFetchData() {
  // 1. Gọi hàm đăng nhập. Thay 'your_username' và 'your_password' bằng dữ liệu từ form
  const token = await loginAndGetToken("anhpham", "abc123");

  // 2. Nếu đăng nhập thành công (có token), thì mới lấy dữ liệu công việc
  if (token) {
    await fetchMyTodos();
  }
}

// Bạn có thể gọi hàm này khi người dùng nhấn nút "Đăng nhập"
handleLoginAndFetchData();
