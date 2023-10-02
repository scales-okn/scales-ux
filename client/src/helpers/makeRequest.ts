// @ts-nocheck
/* eslint-disable */
import { authorizationHeader } from "src/helpers/authorizationHeader";
import store from "src/store";
import streamSaver from 'streamsaver';

const baseURL = "http://localhost:8080";

const sendRequest = async ({
  method,
  path,
  body,
  options,
}: {
  method: string;
  path: string;
  body?: Record<string, any>;
  options?: Record<string, unknown>;
}) => {
  const url = () => {
    if (import.meta.env.MODE === "development") {
      return `${baseURL}${path}`;
    } else {
      return path;
    }
  };
  const token = store.getState().auth.token;
  const authHeader = authorizationHeader(token);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url(), fetchOptions);
    
    let data;
    if (options?.responseType === "text") {
      data = await response.text();
    } else if (options?.responseType === "stream") {
      const fileStream = streamSaver.createWriteStream('scales-okn-data.csv');
      const readableStream = response.body;

      // use pipeTo if it's available; easier and faster
      if(window.WritableStream && readableStream.pipeTo) {
        await readableStream.pipeTo(fileStream)
        return { message: 'Successfully downloaded file'}
      }

      // if pipeTo isn't available, we fallback to the polyfill
      window.writer = fileStream.getWriter();
      const reader = response.body.getReader();
      const pump = () => reader.read()
        .then(({ done, value }) => done
          ? window.writer.close()
          : window.writer.write(value).then(pump));

      pump();

      data = { message: 'Successfully downloaded file'}
    } else {
      data = await response.json();
    }

    if (data.error) {
      console.error(data.error);
    }
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Handle network or fetch errors
    console.error("Request failed:", error);
    throw error;
  }
};

// Export functions for different HTTP methods
export const makeRequest = {
  get: (path: string, options?: Record<string, unknown>) =>
    sendRequest({ method: "GET", path, options }),
  post: (path: string, body: Record<string, any>) =>
    sendRequest({ method: "POST", path, body }),
  put: (path: string, body: Record<string, any>) =>
    sendRequest({ method: "PUT", path, body }),
  patch: (path: string, body: Record<string, any>) =>
    sendRequest({ method: "PATCH", path, body }),
  delete: (path: string) => sendRequest({ method: "DELETE", path }),
};
/* eslint-enable */
