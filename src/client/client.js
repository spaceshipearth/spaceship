import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { InMemoryCache } from "apollo-cache-inmemory";
import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { hydrate } from "react-dom";
import muiTheme from "./../shared/theme";

function AppTree() {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-ssr");
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }, []);

  // We add the Apollo/GraphQL capabilities here (also notice ApolloProvider below).
  const client = new ApolloClient({
    request: async op => {
      op.setContext({
        headers: {
          //          'x-xsrf-token': configuration.csrf || '',
        }
      });
    },
    cache: new InMemoryCache().restore(window["__APOLLO_STATE__"])
  });

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <ThemeProvider theme={muiTheme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

hydrate(<AppTree />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
