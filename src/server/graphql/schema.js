import { gql } from 'apollo-server-express';

// The `_` (underscores) here signify that the queries, mutations, subscriptions will be extended
// by the rest of the schemas. This schema simply ties them all together.
const schema = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    photoUrl: String
  }

  type Category {
    id: ID!
    title: String
    shortDescription: String
    longDescription: String
    displayRank: Int
    goals: [Goal]
  }

  type Goal {
    id: ID!
    title: String
    shortDescription: String
    longDescription: String
    displayRank: Int
    categoryId: ID
    category: Category
  }

  type Mission {
    id: ID!
    goal: Goal
    captain: User
    team: [User]
    startTime: Int
    endTime: Int
  }

  type Query {
    currentUser: User
    categories: [Category]
    upcomingMissions: [Mission]
    completedMissions: [Mission]
    mission(id: ID!): Mission
  }

  type Mutation {
    signIn(email: String!, cont: String): Int
    signOut: ID
    planMission(goalId: ID!): Mission

    upsertCategory(
      id: ID
      title: String
      displayRank: Int
      shortDescription: String
      longDescription: String
    ): Category
    deleteCategory(id: ID!): Boolean
    upsertGoal(
      id: ID
      title: String
      shortDescription: String
      longDescription: String
      displayRank: Int
      categoryId: ID
    ): Goal
    deleteGoal(id: ID!): Boolean

    joinMission(id: ID!): Mission
  }
`;

export default [schema];
