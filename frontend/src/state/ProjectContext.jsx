import React, { createContext, useContext, useState, useCallback } from "react";

const initialState = {
  // upload
  uploadedFile: null,
  uploadedImageUrl: null, // backend storage path
  localPreviewUrl: null, // browser object URL for fast preview
  fileId: null,
  filename: null,
  fileSize: null,
  imageWidth: null,
  imageHeight: null,
  imageFormat: null,
  // print setup
  printType: "billboard",
  printWidth: "",
  printHeight: "",
  printUnit: "ft",
  viewingDistance: "auto",
  fitMode: "native",
  aspectRatioStatus: null,
  // analysis
  targetPPI: null,
  effectivePPI: null,
  requiredPixelWidth: null,
  requiredPixelHeight: null,
  requiredEnlargement: null,
  sourceQuality: null,
  // enhancement
  enhancementMode: "print_accurate",
  processingStatus: "uploaded",
  projectId: null,
  jobId: null,
  mock: true,
  enhancedImageUrl: null,
  enhancedPreviewUrl: null,
  // target = requested; actual = real returned/generated image dimensions
  targetOutputWidth: null,
  targetOutputHeight: null,
  actualOutputWidth: null,
  actualOutputHeight: null,
  outputFormat: null,
};

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(initialState);

  const update = useCallback((patch) => {
    setProject((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setProject(initialState), []);

  return (
    <ProjectContext.Provider value={{ project, update, reset }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
