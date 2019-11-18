import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
import createLoaders from './graphql/loaders';

const router = express.Router();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res, connection }) => {
    if (connection) {
      // For subscriptions
      return {
        models,
      };
    }
    const currentUser = res.locals.currentUser;
    return {
      currentUser,
      loaders: createLoaders(currentUser),
      req,
      res,
    };
  },
});

// the path is / because we are already mounted at the proper location (ie /graphql)
apolloServer.applyMiddleware({ app: router, path: '/' });

export default router;
