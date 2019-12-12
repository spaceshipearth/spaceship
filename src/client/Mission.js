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
import { MissionPlanningStepper } from "./MissionPlanning";
import { Step, Stepper, StepLabel, StepContent } from "@material-ui/core";
import _ from 'lodash';
import { missionDay } from "../shared/util";

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
  let missionHasStarted = false;
  if (mission && mission.startTime) {
    if (mission.startTime * 1000 < Date.now()) {
      missionHasStarted = true;
    }
  }
  return (
    <Container maxWidth="md">
      <MissionPageHeader goal={mission.goal} />
      <Grid container style={{ marginTop: 10 }} spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: 16, minHeight: 400 }}>
            {missionHasStarted ? (
              <>
                <Typography gutterBottom variant="h6">
                  Mission progress
                </Typography>
                <MissionStatusDescription mission={mission}/>
                <MissionProgressStepper mission={mission} />
                <TextField
                  variant="outlined"
                  multiline
                  fullWidth
                  rows={3}
                ></TextField>
                <Button>Post update</Button>
              </>
            ) : (
              <MissionPlanningStepper mission={mission} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <MissionTeamModule
            teamUsers={mission.team}
            currentUser={data.currentUser}
            handleJoinClick={handleJoinClick}
          />
        </Grid>
      </Grid>
      <Paper></Paper>
    </Container>
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

function MissionTeamModule({currentUser, teamUsers, handleJoinClick}) {
  return <Paper style={{ padding: 16 }}>
    <Typography gutterBottom variant="h6">
      Team
    </Typography>
    <WithSignup isSignedIn={currentUser}>
      <Button size="small" color="secondary" onClick={handleJoinClick}>
        Join
      </Button>
    </WithSignup>
    <List>
      {" "}
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
