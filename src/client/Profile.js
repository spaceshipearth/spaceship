import React from 'react';
import gql from 'graphql-tag';
import {
  Typography
} from "@material-ui/core";
import { useQuery } from 'react-apollo';

export const userQuery = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      photoUrl
    }
    currentUser {
      id
    }
  }
`;

function Profile({match}) {
  const { data, loading, error } = useQuery(userQuery, {variables: {id: match.params.userId}});
  if (loading) {
    return '';
  }

  const user = data.user;
  const isOwner = data.currentUser && data.currentUser.id === user.id;
  const msg = isOwner ? 'YOUR PROFILE' : `the profile of ${user.id}`;

  return (
    <>
      <Typography variant="h3">
        Welcome to {msg}
      </Typography>
    </>
  );
}

export default Profile;
