import React from 'react';
import './Home.css';
import gql from 'graphql-tag';
import {
  Avatar,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  Link,
  Card,
  Paper,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
} from "@material-ui/core";
import { useQuery, useMutation } from 'react-apollo';
import AvatarPng from "../../public/avatar.png";
import { Signup as WithSignup } from "./Signin";
import {SharePrompt} from './Share';
import { MissionPlanningStepper,sharingMessage } from "./MissionPlanning";
import { Step, Stepper, StepLabel, StepContent } from "@material-ui/core";
import _ from 'lodash';
import { missionDay } from "../shared/util";
import { Color } from "./../shared/theme";
import { absoluteUrl } from "../shared/util";

export const missionQuery = gql`
  query Mission($id: ID!) {
    mission(id: $id) {
      id
      startTime
      endTime
      captain {
        id
        name
        photoUrl
      }
      goal {
        id
        title
        shortDescription
        longDescription
        displayRank
      }
      team {
        id
        name
        photoUrl
      }
    }
    currentUser {
      id
    }
  }
`;

export const joinMissionMutation = gql`
  mutation JoinMission($id: ID!) {
    joinMission(id: $id) {
      id
      team {
        id
        name
        photoUrl
      }
    }
  }
`;

function timeTillStart(mission) {
  const SECONDS_PER_HOUR = 60 * 60;
  const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;
  const deltaSeconds =  mission.startTime - Date.now()/1000;
  return deltaSeconds > SECONDS_PER_DAY ? Math.floor(deltaSeconds/SECONDS_PER_DAY) + ' days' : Math.round(deltaSeconds/SECONDS_PER_HOUR) + ' hours';
}
function Mission({match}) {
  const [joinTeamMutation] = useMutation(joinMissionMutation);
  const { data, loading, error } = useQuery(missionQuery, {
    variables: { id: match.params.missionId }
  });

  function handleJoinClick () {
    joinTeamMutation({variables:{id:mission.id}});
  }

  if (loading) {
    return '';
  }
  const mission = data.mission;
  const currentUser = data.currentUser;
  let missionHasStarted = false;
  if (mission && mission.startTime) {
    if (mission.startTime * 1000 < Date.now()) {
      missionHasStarted = true;
    }
  }
  const missionHasEnded = mission.endTime * 1000 < Date.now();


  const isOnMissionTeam = currentUser && mission.team.filter(u=>u.id == currentUser.id);
  const isCaptain = currentUser && mission.captain.id == currentUser.id;

  return (
    <Container maxWidth="md">
      <MissionPageHeader goal={mission.goal} />

      {!isOnMissionTeam && !missionHasStarted ? (
        <MissionJoinPrompt
          mission={mission}
          handleJoinClick={handleJoinClick}
          currentUser={currentUser}
        />
      ) : (
        ""
      )}

      {isOnMissionTeam && !missionHasStarted && !isCaptain ? (
        <MissionPending mission={mission} />
      ) : (
        ""
      )}

      <MissionTeamModule teamUsers={mission.team} />

      <Paper style={{ padding: 16 }}>
        {missionHasStarted ? (
          <>
            <Typography gutterBottom variant="h6">
              Mission progress
            </Typography>
            <MissionStatusDescription mission={mission} />
            <MissionProgressStepper mission={mission} />
          </>
        ) : (
          <>
            <Typography>
              This mission starts in {timeTillStart(mission)}.
            </Typography>
            {isCaptain ? <MissionPlanningStepper mission={mission} /> : ""}
          </>
        )}
      </Paper>
      <Paper style={{ padding: 16, marginTop: 20, minHeight: 400 }}>
        <MissionDiscussion />
      </Paper>
    </Container>
  );
}

function MissionDiscussion() {
  return (
    <Box>
      <TextField variant="outlined" multiline fullWidth rows={3}></TextField>
      <Button>Post update</Button>
    </Box>
  );

}

function MissionStatusDescription({mission}) {
  const missionHasEnded = mission.endTime * 1000 < Date.now();
  return missionHasEnded ? (
    <Typography>Your mission to has ended. How did it go?</Typography>
  ) : (
    <Typography>
      Today is day {missionDay(mission)} of your 7 day mission to{" "}
      {mission.goal.shortDescription.toLowerCase()}.
    </Typography>
  );
}

function MissionProgressStepper({mission}) {

  return <Stepper activeStep={missionDay(mission) - 1} alternativeLabel={true}>
    {_.range(7).map(index => (
      <Step key={index}>
        <StepLabel></StepLabel>
      </Step>
    ))}
  </Stepper>;
}

function MissionJoinPrompt({mission, handleJoinClick, currentUser}) {
  return <Paper
     style={{
       padding: 20,
       marginTop:20,
       backgroundColor: Color.BACKGROUND_GRAY
     }}
   >
     <Typography>
       {mission.captain.name} has invited you to join them on this
       mission. During the mission, we will send you reminders to {' '}
       {mission.goal.shortDescription.toLowerCase()} every day.
     </Typography>
     <br />
     <Typography>
       This mission starts in {timeTillStart(mission)}.
     </Typography>
     <br />
     <WithSignup isSignedIn={currentUser}>
       <Button
         fullWidth
         size="small"
         variant="contained"
         color="primary"
         onClick={handleJoinClick}
       >
         Join
       </Button>
     </WithSignup>
   </Paper>;
}


function MissionPageHeader({goal}) {
  return (
    <Card key={goal.id}>
      <CardMedia
        style={{ height: 140 }}
        image={`/goals/${goal.id}.jpg`}
        title={goal.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {goal.title}
        </Typography>
        <Typography
          variant="body1"
          component="span"
          dangerouslySetInnerHTML={{ __html: goal.longDescription }}
        />
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
}
/*    <Typography gutterBottom variant="h6">
      Team
    </Typography>;*/
function MissionPending({mission}) {
  const sharingUrl = absoluteUrl({ pathname: `/mission/${mission.id}` });
  return (
    <Paper style={{ padding: 16, marginTop: 20, marginBottom: 20 }}>
      <Typography>This mission starts in {timeTillStart(mission)}.  Invite your friends!</Typography>
      <br/>
      <SharePrompt
        sharingUrl={sharingUrl}
        shareMessage={sharingMessage(sharingUrl)}
      />
    </Paper>
  );

}


function MissionTeamModule({teamUsers}) {
  return <Paper style={{ padding: 16, marginTop: 20, marginBottom: 20 }}>
      <List>
        {teamUsers.map((user, idx) => (
          <ListItem
            button
            component={Link}
            to={`/profile/${user.id}`}
            key={user.id}
            divider={idx < teamUsers.length - 1}
          >
            <ListItemAvatar>
              <Avatar
                alt={user.name}
                imgProps={{ width: "40", height: "40" }}
                src={user.photoUrl || AvatarPng}
              />
            </ListItemAvatar>

            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Paper>;
}


export default Mission;
