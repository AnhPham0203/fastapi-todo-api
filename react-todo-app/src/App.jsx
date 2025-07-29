// src/App.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Checkbox,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Link,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import "./App.css";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase auth from your firebase.js file

const API_URL = "https://fastapi-todo-app-xs0i.onrender.com";

function App() {
  // State cho dữ liệu
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // State cho việc xác thực
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // State để chuyển đổi form

  // State for showing notifications (Snackbar)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Effect này sẽ chạy mỗi khi 'token' thay đổi.
  useEffect(() => {
    const fetchTodos = async () => {
      if (!token) {
        setTodos([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/todos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            await signOut(auth);
          }
          throw new Error("Could not fetch todos");
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error(error.message);
        setSnackbar({ open: true, message: "Could not fetch todos. Please log in again.", severity: "error" });
      }
    };

    fetchTodos();
  }, [token]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            user.getIdToken().then((idToken) => {
                setToken(idToken);
            });
        } else {
            setToken(null);
        }
    });
    return () => unsubscribe();
}, []);

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, username, password);
        setSnackbar({ open: true, message: "Login Successful.", severity: "success" });
        setUsername("");
        setPassword("");
    } catch (error) {
        setSnackbar({ open: true, message: error.message || "Login Failed.", severity: "error" });
    }
  };

  // Hàm xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        await createUserWithEmailAndPassword(auth, username, password);
        setSnackbar({ open: true, message: "Registration Successful! Please log in.", severity: "success" });
        setIsRegistering(false); // Quay lại form đăng nhập sau khi đăng ký thành công
        setUsername("");
        setPassword("");
    } catch (error) {
        setSnackbar({ open: true, message: error.message || "Registration Failed.", severity: "error" });
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSnackbar({ open: true, message: "Logged Out.", severity: "info" });
    } catch {
      setSnackbar({ open: true, message: "Logout failed.", severity: "error" });
    }
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
      setTodos([...todos, addedTodo]);
      setNewTodo("");
    } catch (error) {
      console.error(error.message);
    }
  };

  // Hàm xử lý xóa công việc
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
      setTodos(todos.filter((todo) => todo.id !== todoId));
    } catch (error) {
      console.error(error.message);
    }
  };

  // Hàm xử lý đánh dấu công việc là hoàn thành hoặc chưa hoàn thành
  const handleToggleComplete = async (todo) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) {
        throw new Error("Failed to update todo");
      }
      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Giao diện đăng nhập và đăng ký
  if (!token) {
    return (
      <div className="login-container">
        <Container component="main" maxWidth="xs">
          <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
            </Typography>
            <Box component="form" onSubmit={isRegistering ? handleRegister : handleLogin} sx={{ width: '100%', mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Địa chỉ Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
              <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
              </Alert>
          </Snackbar>
        </Container>
      </div>
    );
  }

  // Giao diện ứng dụng chính
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Full-Stack Todo List
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleAddTodo} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Thêm công việc mới..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Thêm
          </Button>
        </Box>

        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              divider
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Checkbox
                edge="start"
                checked={todo.completed}
                tabIndex={-1}
                disableRipple
                onChange={() => handleToggleComplete(todo)}
              />
              <ListItemText
                primary={todo.task}
                sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              />
            </ListItem>
          ))}
        </List>
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
