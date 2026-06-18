import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { LoginPage } from "./pages/LoginPage";
import { SsoCallbackPage } from "./pages/SsoCallbackPage";
import { PostAuthPage } from "./pages/PostAuthPage";
import { WorkspacePickerPage } from "./pages/WorkspacePickerPage";
import { ConfigProvider } from "./ConfigProvider";
import { LandingPage } from "./pages/LandingPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <ConfigProvider>
              <LoginPage />
            </ConfigProvider>
          }
        />
        <Route
          path="/sso-callback"
          element={
            <ConfigProvider>
              <SsoCallbackPage />
            </ConfigProvider>
          }
        />
        <Route
          path="/post-auth"
          element={
            <ConfigProvider>
              <PostAuthPage />
            </ConfigProvider>
          }
        />
        <Route path="/pick-workspace" element={<WorkspacePickerPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
