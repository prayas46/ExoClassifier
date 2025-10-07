import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useLenis } from "./hooks/use-lenis";
import React from "react";

function Root() {
  useLenis();
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
