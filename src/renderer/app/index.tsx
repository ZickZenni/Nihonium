import { createRoot } from "react-dom/client";
import AppRouter from "./router";
import StartupScreen from "@renderer/components/StartupScreen";

const root = createRoot(document.body);
root.render(
  <div>
    <StartupScreen />
    <AppRouter />
  </div>
);
