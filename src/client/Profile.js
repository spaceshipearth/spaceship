import React from 'react';
import {
  Typography
} from "@material-ui/core";

function Profile({match}) {
  return (
    <>
      <Typography variant="h3">
        Welcome to YOUR PROFILE, {match.params.userId}
      </Typography>
    </>
  );
}

export default Profile;
