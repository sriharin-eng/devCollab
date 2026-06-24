import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage      from "./pages/LandingPage";       // ← new
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import WorkspacePage    from "./pages/WorkspacePage";
import ProjectPage      from "./pages/ProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AIPage           from "./pages/AIPage";
import CodeReviewPage   from "./pages/CodeReviewPage";

import ProtectedRoute   from "./routes/ProtectedRoute";
import DashboardLayout  from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<LandingPage />} />   {/* ← landing page */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected (dashboard) ── */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Workspaces list — was "/" before */}
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