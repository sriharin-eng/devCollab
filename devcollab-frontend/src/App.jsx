import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import WorkspacePage from "./pages/WorkspacePage";
import ProjectPage from "./pages/ProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AIPage from "./pages/AIPage";
import CodeReviewPage from "./pages/CodeReviewPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Workspaces list */}
          <Route index element={<WorkspacePage />} />

          {/* Projects + Activity inside a workspace */}
          <Route path="workspace/:workspaceId" element={<ProjectPage />} />

          {/* Tasks + Wiki inside a project */}
          <Route
            path="workspace/:workspaceId/project/:projectId"
            element={<ProjectDetailPage />}
          />

          {/* AI features */}
          <Route path="ai" element={<AIPage />} />

          {/* Code review */}
          <Route path="code-review" element={<CodeReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
