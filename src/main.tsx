import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { useNotifications } from "./app/hooks/useNotification.ts";
import "./styles/index.css";

function Root() {
  useNotifications();
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);