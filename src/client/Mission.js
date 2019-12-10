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
} from "@material-ui/core";
import { useQuery, useMutation } from 'react-apollo';
import AvatarPng from "../../public/avatar.png";
import { Signup as WithSignup } from "./Signin";
import {SharePrompt} from './Share';
import {MissionCreateStepper} from './MissionConfig';

export const missionQuery = gql`
  query Mission($id: ID!) {
    mission(id: $id) {
      id
      startTime
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
  const missionHasStarted = false;

  let missionStartMsg = "Mission starts";
  if (mission && mission.startTime) {
    if (mission.startTime * 1000 < Date.now()) {
      missionStartMsg = "Mission has started";
    } else {
      missionStartMsg = "Mission starts in " + timeTillStart(mission);
    }
  }
  return (
    <Container maxWidth="md">
      <MissionPageHeader goal={mission.goal} />
      <Grid container style={{ marginTop: 10 }} spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: 16 }}>
            {missionHasStarted ? (
              ""
            ) : (
              <>
                <Typography gutterBottom variant="h6">
                  Plan a mission
                </Typography>
                {mission.startTime ? <Paper> {missionStartMsg} </Paper> : ""}

                <MissionCreateStepper mission={mission} />
              </>
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

function MissionPageHeader({goal}) {
  return <Card key={goal.id}>
    <CardMedia
      style={{ height: 140 }}
      image={`/goals/${goal.id}.jpg`}
      title={goal.title}
    />
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        {goal.title}
      </Typography>
      <br />
      <Typography
        variant="body1"
        color="textSecondary"
        component="p"
        dangerouslySetInnerHTML={{ __html: goal.longDescription }}
      />
    </CardContent>
    <CardActions></CardActions>
  </Card>;
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
