import { authSelector } from "store/auth";
import { authorizationHeader } from "utils";
import type { RootState, AppDispatch } from "store";

interface InitialState {
  loadingDocument: boolean;
  document: any;
}

const initialState: InitialState = {
  loadingDocument: true,
  document: null
};

export async function fetchDocument(ringId, ringVersion, entityType, docId) {

  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    const docUrl = `/proxy/api/document/${ringId}/${ringVersion}/${entityType}/${docId}`;
    try {
      const response = await fetch(docUrl, {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
          ...authHeader
        },
      });

      if (response.status === 200) {
        const html = await response.text();
        return html;
      } else {
        return "<div>There was an error retrieving this document.</div>";
      }
    } catch (error) {
      return "<div>There was an error retrieving this document.</div>";
    }
  };
}