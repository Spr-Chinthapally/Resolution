import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fileUrl = (storagePath) => `${API}/files/${storagePath}`;

export async function fetchConfig() {
  const { data } = await api.get("/config");
  return data;
}

export async function uploadImage(file, width, height) {
  const form = new FormData();
  form.append("file", file);
  form.append("width", String(width));
  form.append("height", String(height));
  const { data } = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data;
}
