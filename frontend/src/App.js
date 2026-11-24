import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import WorkflowPage from "@/pages/WorkflowPage";
import { ProjectProvider } from "@/state/ProjectContext";

function App() {
  useEffect(() => {
    const el = document.querySelector("[data-emergent-splash]");
    if (el) el.remove();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<WorkflowPage />} />
          </Routes>
        </ProjectProvider>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
