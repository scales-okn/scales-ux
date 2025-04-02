// @ts-nocheck
/* eslint-disable */
import { authorizationHeader } from "src/helpers/authorizationHeader";
import store from "src/store";
import streamSaver from "streamsaver";

const baseURL = "http://localhost:8082";

// host stream saver service worker locally
streamSaver.mitm = "/streamsaver/mitm.html";

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

  const fullPath = options?.params
    ? `${url()}?${new URLSearchParams(options.params).toString()}`
    : url();

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(fullPath, fetchOptions);

    let data;
    if (options?.responseType === "text") {
      data = await response.text();
    } else if (options?.responseType === "stream") {
      const fileStream = streamSaver.createWriteStream("scales-okn-data.csv");
      const readableStream = response.body;

      // use pipeTo if it's available; easier and faster
      if (window.WritableStream && readableStream.pipeTo) {
        await readableStream.pipeTo(fileStream);
        return { message: "Successfully downloaded file" };
      }

      // if pipeTo isn't available, we fallback to the polyfill
      window.writer = fileStream.getWriter();
      const reader = response.body.getReader();
      const pump = () =>
        reader
          .read()
          .then(({ done, value }) =>
            done
              ? window.writer.close()
              : window.writer.write(value).then(pump),
          );

      pump();

      data = { message: "Successfully downloaded file" };
    } else {
      data = await response.json();
    }
    if (data.code && data.code !== 200) {
      console.error(data.message);
      if (options?.notify) {
        options.notify(data.message, "error");
      }
    }

    return data;
  } catch (error) {
    // Handle network or fetch errors
    if (options?.responseType === "stream" && error === undefined) {
      // file download cancelled
      return { message: "File download cancelled" };
    }
    console.error("Request failed:", error);
    throw error;
  }
};

// Export functions for different HTTP methods
export const makeRequest = {
  get: (path: string, options?: Record<string, unknown>) =>
    sendRequest({ method: "GET", path, options }),
  post: (
    path: string,
    body: Record<string, any>,
    options?: Record<string, unknown>,
  ) => sendRequest({ method: "POST", path, body, options }),
  put: (
    path: string,
    body: Record<string, any>,
    options?: Record<string, unknown>,
  ) => sendRequest({ method: "PUT", path, body, options }),
  patch: (
    path: string,
    body: Record<string, any>,
    options?: Record<string, unknown>,
  ) => sendRequest({ method: "PATCH", path, body, options }),
  delete: (path: string, options?: Record<string, unknown>) =>
    sendRequest({ method: "DELETE", path, options }),
};
/* eslint-enable */
