import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import App from "./App";
import { Game } from "./Game";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/game",
    element: <Game />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
