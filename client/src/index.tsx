import React from "react";
import { createRoot } from "react-dom/client";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import { Provider } from "react-redux";
import reportWebVitals from "./reportWebVitals";
import "./hijackEffects";
import App from "./App";

import "./styles/global.css";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </ApolloProvider>
  </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
