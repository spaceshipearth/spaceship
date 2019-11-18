import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

import Sequelize from 'sequelize';
//import { absoluteUrl } from './../../shared/display';
import * as models from './../db/models';
import * as email from './../email';
import * as nanoid from 'nanoid';
import { createUser } from './../auth';
import _ from 'lodash';

/*const imgixClient = new ImgixClient({
  domain: 'spaceship.imgix.net',
  secureURLToken: process.env.IMGIX_SECRET,
});*/


export function absoluteUrl(path) {
  if (typeof window != "undefined" && window.location) {
    return window.location.origin + path;
  } else {
    return `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}${
      process.env.APP_PORT ? ":" + process.env.APP_PORT : ""
    }${path}`;
  }
}


const USER_NOT_DELETED = { deletionToken: { [models.Sequelize.Op.eq]: '' } };

const isAuthenticated = (parent, args, { currentUser }) => {
  return currentUser ? skip : new ForbiddenError('Not logged in.');
};
const isAdmin = combineResolvers(isAuthenticated, (parent, args, { currentUser: { isAdmin } }) =>
  isAdmin ? skip : new ForbiddenError('Not authorized. ')
);

export default {
  Query: {
    currentUser: async (parent, {}, { currentUser }) => {
      return currentUser;
    },
    categories: async (parent, {}, {}) => {
      return models.Category.findAll();
    },
    mission: async (parent, {id}, {}) => {
      return models.Mission.findByPk(id);
    }
  },
  Category: {
    goals: async (parent, {}, {}) => {
      return models.Goal.findAll({ where: { categoryId: parent.id } });
    }
  },
  Mission: {
    goal: async (parent, {}, {}) => {
      return models.Goal.findOne({ where: { id: parent.goalId } });
    },
    captain: async (parent, {}, {}) => {
      return models.User.findOne({ where: { id: parent.captainId } });
    },
    team: async (parent, {}, {}) => {
      //const userMissions = await models.UserMission.findAll({ where: { missionId: parent.id }});
      return;
    },
  },
  Mutation: {
    signIn: async (parent, { email: userEmail }, { req }) => {
      const whereClause = Object.assign({}, { email: userEmail });
      // todo validate email
      let user = await models.User.findOne({ where: whereClause });
      if (!user) {
        user = await createUser({
          name: userEmail,
          email: userEmail
        });
      }
      user.password = nanoid(10);
      await user.save();
      const signInUrl = absoluteUrl(
        `/auth/signin?email=${encodeURIComponent(
          user.email
        )}&token=${encodeURIComponent(user.password)}`
      );

      await email.send({
        to: user.email,
        subject: `Sign-in to 2020 Madness`,
        text: `Click here to sign-in to 2020 Madness: ${signInUrl}`
      });
      return;
    },
    signOut: async (parent, {}, { req, res, currentUser }) => {
      delete res.locals.currentUser;
      delete req.session.currentUserId;
      return currentUser.id;
    },
    planMission: async (parent, { goalId }, { req, res, currentUser }) => {
      return models.Mission.create({
        goalId: goalId,
        captainId: currentUser.id
      });
    }
  }
};
