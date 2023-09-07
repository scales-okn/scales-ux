// makeRequest.ts
import { authorizationHeader } from "@helpers/authorizationHeader";
import store from "@store";

// Define a base URL for your API (you can customize this)
const baseURL = "http://localhost:8080"; // Replace with your API URL

// Helper function to send a request
const sendRequest = async (
  method: string,
  path: string,
  body?: Record<string, any>,
) => {
  const url = `${baseURL}${path}`;
  const token = store.getState().auth.token;
  const authHeader = authorizationHeader(token);

  const options: RequestInit = {
    method,
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network or fetch errors
    console.error("Request failed:", error);
    throw error;
  }
};

// Export functions for different HTTP methods
export const makeRequest = {
  get: (path: string) => sendRequest("GET", path),
  post: (path: string, body: Record<string, any>) =>
    sendRequest("POST", path, body),
  put: (path: string, body: Record<string, any>) =>
    sendRequest("PUT", path, body),
  patch: (path: string, body: Record<string, any>) =>
    sendRequest("PATCH", path, body),
  delete: (path: string) => sendRequest("DELETE", path),
};
