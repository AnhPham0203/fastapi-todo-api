// src/App.jsx
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://fastapi-todo-app-xs0i.onrender.com";

function App() {
  // State cho dữ liệu
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // State cho việc xác thực
  const [token, setToken] = useState(localStorage.getItem("api_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Effect này sẽ chạy mỗi khi 'token' thay đổi.
  // Khi đăng nhập thành công, token thay đổi -> effect chạy để lấy todos.
  // Khi đăng xuất, token thay đổi (về null) -> effect chạy và không làm gì.
  useEffect(() => {
    const fetchTodos = async () => {
      if (!token) {
        setTodos([]); // Nếu không có token (đã đăng xuất), xóa danh sách todos
        return;
      }

      try {
        const response = await fetch(`${API_URL}/todos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          // Nếu token hết hạn, server sẽ trả về 401
          if (response.status === 401) {
            handleLogout(); // Tự động đăng xuất
          }
          throw new Error("Could not fetch todos");
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchTodos();
  }, [token]); // Phụ thuộc vào token

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("api_token", data.access_token);
      setToken(data.access_token); // Cập nhật state token, kích hoạt useEffect
      setUsername(""); // Xóa input
      setPassword(""); // Xóa input
    } catch (error) {
      alert(error.message);
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("api_token");
    setToken(null); // Cập nhật state token, kích hoạt useEffect
  };

  // Hàm xử lý thêm công việc mới
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim() === "" || !token) return;

    try {
      const response = await fetch(`${API_URL}/todos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: newTodo }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }
      const addedTodo = await response.json();
      setTodos([...todos, addedTodo]); // Cập nhật UI ngay lập tức
      setNewTodo(""); // Xóa input
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDelete = async (todoId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      // Cập nhật UI ngay lập tức
      setTodos(todos.filter((todo) => todo.id !== todoId));
    } catch (error) {
      console.error(error.message);
    }
  };

  // Nếu chưa đăng nhập (không có token), hiển thị form đăng nhập
  if (!token) {
    return (
      <div className="App">
        <h1>Please Log In</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị ứng dụng Todo
  return (
    <div className="App">
      <h1>Full-Stack Todo List</h1>
      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Thêm công việc mới..."
        />
        <button type="submit">Thêm</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.task}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
