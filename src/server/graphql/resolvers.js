import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

import Sequelize from 'sequelize';
import { absoluteUrl } from './../../shared/util';
import * as models from './../db/models';
import * as email from './../email';
import * as nanoid from 'nanoid';
import { createUser } from './../auth';
import _ from 'lodash';

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
    mission: async (parent, { id }, {}) => {
      return models.Mission.findByPk(id);
    },
    user: async (parent, { id }, {}) => {
      return models.User.findByPk(id);
    },
    upcomingMissions: async (parent, { id }, { currentUser }) => {
      const captainedMissions = await models.Mission.findAll({
        where: { captainId: currentUser.id }
      });
      const joinedMissionUserRows = await models.UserMission.findAll({
        where: { userId: currentUser.id }
      });
      const joinedMissions = await models.Mission.findAll({
        where: { id: joinedMissionUserRows.map(mu => mu.missionId) }
      });
      return captainedMissions.concat(joinedMissions).filter(m => m.startTime);
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
    startTime: async (parent, {}, {}) => {
      return parent.startTime && parent.startTime.getTime() / 1000;
    },
    endTime: async (parent, {}, {}) => {
      return parent.endTime && parent.endTime.getTime() / 1000;
    },
    team: async (parent, {}, {}) => {
      const userMissions = await models.UserMission.findAll({
        where: { missionId: parent.id }
      });
      const captain = await models.User.findByPk(parent.captainId);
      const team = await models.User.findAll({
        where: { id: userMissions.map(um => um.userId) }
      });
      team.push(captain);
      return team;
    }
  },
  Mutation: {
    signIn: async (_, { email: userEmail, cont }, { req }) => {
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
      const signInUrl = absoluteUrl({
        pathname: "/auth/signin",
        query: { email: user.email, token: user.password, cont }
      });

      // on localhost, email might not work; log sign-in links to the console
      if (process.env.NODE_ENV === 'development') {
        console.log(signInUrl);
      }

      await email.send({
        to: user.email,
        subject: `Sign-in to Spaceship Earth`,
        text: `Click here to sign-in to Spaceship Earth: ${signInUrl}`
      });
      return;
    },
    upsertCategory: async (_, args, { req, res, currentUser }) => {
      await models.Category.upsert(args);
      return models.Category.findByPk(args.id);
    },
    deleteCategory: async (_, { id }, { req, res, currentUser }) => {
      return models.Category.destroy({ where: { id } });
    },
    deleteGoal: async (_, { id }, { req, res, currentUser }) => {
      return models.Goal.destroy({ where: { id } });
    },
    upsertGoal: async (_, args, { req, res, currentUser }) => {
      await models.Goal.upsert(args);
      return models.Goal.findByPk(args.id);
    },
    signOut: async (_, {}, { req, res, currentUser }) => {
      delete res.locals.currentUser;
      delete req.session.currentUserId;
      return currentUser.id;
    },
    planMission: async (_, { goalId }, { currentUser }) => {
      return models.Mission.create({
        goalId: goalId,
        captainId: currentUser.id
      });
    },
    scheduleMission: async (_, { id, startTime }, { }) => {
      await models.Mission.update(
        {
          startTime: startTime * 1000,
          endTime: 1000 * (startTime + 7 * 24 * 60 * 60)
        },
        { where: { id } }
      );
      return models.Mission.findByPk(id);
    },
    joinMission: async (_, { id }, { req, res, currentUser }) => {
      // TODO: enforce uniqueness in the DB
      await models.UserMission.create({
        userId: currentUser.id,
        missionId: id
      });
      return models.Mission.findByPk(id);
    },
    updateUser: async (_, { input }, { currentUser }) => {
      const user = await models.User.findByPk(input.userId);
      if (!currentUser.isAdmin && currentUser.id !== user.id) {
        return {
          success: false,
          message: 'unauthorized',
          user: user,
        };
      }

      user.set(input.field, input.value);
      user.save();

      return {
        success: true,
        message: 'user updated',
        user: user,
      };
    },
  }
};
