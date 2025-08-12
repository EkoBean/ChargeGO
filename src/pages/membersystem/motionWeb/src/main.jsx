import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.css";
import Login from "./login";
import Register from "./register";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Register />
  </StrictMode>
);
