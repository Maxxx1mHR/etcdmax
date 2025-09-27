import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: "#3883fa",
            siderBg: "#3883fa",
            triggerBg: "#3883fa",
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
