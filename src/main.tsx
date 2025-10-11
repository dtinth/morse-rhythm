import "@fontsource/tasa-orbiter/400.css";
import "@fontsource/tasa-orbiter/500.css";
import "@fontsource/tasa-orbiter/600.css";
import "@fontsource/tasa-orbiter/700.css";
import "@fontsource/tasa-orbiter/800.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import App from "./App";
import { Editor } from "./Editor";
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
  {
    path: "/editor",
    element: <Editor />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
