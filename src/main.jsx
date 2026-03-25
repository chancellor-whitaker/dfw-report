import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createRoot } from "react-dom/client";

import "./index.css";

import { StrictMode } from "react";

import Playground from "./Playground/index.jsx";
import App from "./App.jsx";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App>
      <Playground></Playground>
    </App>
  </StrictMode>
);
