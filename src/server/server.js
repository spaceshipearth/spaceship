// dotenv first so that the env variables are available early
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { ApolloProvider, getDataFromTree } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import connectRedis from "connect-redis";
import express from "express";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/styles";
import fetch from "node-fetch";
import React from "react";
import redis from "redis";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import session from "express-session";
import * as Sentry from "@sentry/node";

import App from "../client/App";
import muiTheme from "./../shared/theme";
import { User } from "./db/models";

import apolloRouter from "./apollo";
import authRouter from "./auth";

const isProduction = process.env.NODE_ENV === "production";

// Use sentry for production error monitoring
if (process.env.SENTRY_DSN) {
  https: Sentry.init({ dsn: process.env.SENTRY_DSN, debug: !isProduction });

  // Sentry registers a handler that prevents node from logging this to console
  // github.com/getsentry/sentry-javascript/issues/1909.
  process.on("unhandledRejection", (reason, p) => {
    console.warn("Unhandled Rejection at:", p, "reason:", reason);
  });
} else if (isProduction) {
  throw new Error("Refusing to run in production without Sentry");
  process.exit();
}

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

function sessionMiddleware() {
  const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
  const RedisStore = connectRedis(session);

  const store = new RedisStore({
    client:redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    })
  });

  return session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: false,
      maxAge: SESSION_MAX_AGE * 1000 /* milliseconds */
    }
  });
}

async function currentUserMiddleware(req, res, next) {
    // load current user from DB
    const userId = req.session.currentUserId;
    if (userId) {
      res.locals.currentUser = await User.findByPk(
        String(req.session.currentUserId)
      );
      // this should only be false in dev if we emptied the DB or something
      if (res.locals.currentUser) {
        Sentry.configureScope(scope => {
          scope.setUser({
            id: res.locals.currentUser.id,
            email: res.locals.currentUser.email
          });
        });
      }
    }
    next();
  }

async function requestHandler(req, res, next) {
  res.setHeader("content-type", "text/html");

  const context = {};
  //  const nonce = createNonceAndSetCSP(res);

  // GraphQL client
  const apolloClient = await createApolloClient(req);

  // Material UI CSS Management
  const sheets = new ServerStyleSheets();

  // We need to set leave out Material-UI classname generation when traversing the React tree for
  // react-apollo data. a) it speeds things up, but b) if we didn't do this, on prod, it can cause
  // classname hydration mismatches.
  const completeApp = isApolloTraversal => (
    <ApolloProvider client={apolloClient}>
      <StaticRouter location={req.url} context={context}>
        {!isApolloTraversal ? (
          sheets.collect(
            <ThemeProvider theme={muiTheme}>
              <App />
            </ThemeProvider>
          )
        ) : (
          <App />
        )}
      </StaticRouter>
    </ApolloProvider>
  );

  // Get "initialState" by executing all the GraphQL in the tree
  try {
    await getDataFromTree(completeApp(true /* isApolloTraversal */));
  } catch (ex) {
    next(ex);
    return;
  }
  const initialState = apolloClient.extract();

  // Render the app
  const markup = renderToString(completeApp(false /* isApolloTraversal */));
  const css = sheets.toString();

  // Handle a static redirect or render the page
  const currentUser = res.locals.currentUser;
  if (context.url) {
    res.redirect(context.url);
  } else {
    res
      .status(200)
      .send(htmlBody({ assets, markup, css, initialState, currentUser, req }));
  }
}

function htmlBody({ assets, markup, css, initialState, currentUser, req }) {

  const ogUrl = "https://spaceshipearth.org";
  const ogSiteName = "Spaceship Earth";
  const ogDesc = "";
  const ogImage = `${process.env.CDN_ROOT}/static/img/logo.jpg`;
  const viewport = "width=device-width, initial-scale=1";

  return `<!doctype html>
  <html lang="">
  <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charset="utf-8" />
      <title>Spaceship Earth</title>
      <meta name="description" content="Putting the fun into fundraising. Buy low, sell high, BEAT TRUMP!" />
      <meta name="viewport" content="${viewport}">
      <link rel="shortcut icon" href="${process.env.CDN_ROOT}/favicon.ico" />

      <meta property="og:title" content="Spaceship Earth" />
      <meta property="og:description" content="${ogDesc}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${ogUrl}" />
      <meta property="og:site_name" content="${ogSiteName}" />
      <meta property="og:image" content="${ogImage}" />

      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />

      ${
        assets.client.css
          ? `<link rel="stylesheet" href="${assets.client.css}">`
          : ""
      }
      ${css ? `<style id='jss-ssr'>${css}</style>` : ""}
      ${
        isProduction
          ? `<script src="${assets.client.js}" defer></script>`
          : `<script src="${assets.client.js}" defer crossorigin></script>`
      }
  </head>
  <body>
  <script>
    window.__APOLLO_STATE__ = ${JSON.stringify(initialState).replace(
      /</g,
      "\\u003c"
    )};
    window.configuration = ${JSON.stringify({ currentUser }).replace(
      /</g,
      "\\u003c"
    )};
    // https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
    if (window.location.hash === "#_=_"){
      history.replaceState
          ? history.replaceState(null, null, window.location.href.split("#")[0])
          : window.location.hash = "";
    }
    </script>
  <div id="root">${markup}</div>
  </body>
  </html>`;
}

// We create an Apollo client here on the server so that we can get server-side rendering in properly.
async function createApolloClient(req) {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `\n[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
            locations
          )}, Path: ${path}\n`
        )
      );
    }
    if (networkError) {
      console.log(`\n[Network error]: ${networkError}\n`);
    }
  });

  const cookieLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        cookie: req.get("cookie")
      }
    });
    return forward(operation);
  });

  const httpLink = new HttpLink({
    uri: `http://localhost:${req.socket.localPort}/graphql`,
    fetch
  });

  const link = ApolloLink.from([errorLink, cookieLink, httpLink]);

  const client = new ApolloClient({
    ssrMode: true,
    link,
    cache: new InMemoryCache()
  });

  return client;
}

const server = express();

server
  .disable("x-powered-by")
  .use(Sentry.Handlers.requestHandler())
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .use(express.urlencoded()) // body decoding middleware url-encoded Content-Type
  .use(express.json()) // body decoding middleware for json Content-Type
  .set("trust proxy", 1) // trust first proxy
  .use(sessionMiddleware())
  .use(currentUserMiddleware)
  .use("/auth", authRouter)
  .use("/graphql", apolloRouter)
  .get("/*", requestHandler)
  .use(Sentry.Handlers.errorHandler());

export default server;
