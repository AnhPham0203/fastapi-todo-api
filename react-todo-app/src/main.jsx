// Fast_api-Learning/react-todo-app/src/main.jsx

import { StrictMode } from "react"; // Giữ nguyên dòng này
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import ErrorBoundary from "./ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Chỉ cần gọi <StrictMode> thay vì <React.StrictMode>
  <StrictMode>
    <ErrorBoundary>
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </ErrorBoundary>
  </StrictMode>
);
