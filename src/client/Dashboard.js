import React from 'react';
import './Home.css';
import gql from 'graphql-tag';
import { Avatar, Divider, Container, List,ListItem, Grid, Card, CardActionArea, CardContent, CardMedia, CardActions, Typography,Paper, Button, Box, ListItemText, ListItemIcon, ListItemSecondaryAction, ListItemAvatar } from '@material-ui/core';
import { useQuery, useMutation } from 'react-apollo';
import { Link, Redirect } from 'react-router-dom';
import {timeTillStart} from './Mission';

export const dashboardQuery = gql`
query Dashboard {
  upcomingMissions {
    id
    goal {
      id
      title
      shortDescription
      longDescription
      displayRank
      categoryId
    }
    captain {
      id
    name
    }
    team {
      id
      name
    }
    startTime
    endTime
  }

  categories {
    id
    title
    displayRank
    shortDescription
    longDescription
    goals {
      id
      title
      shortDescription
      longDescription
      displayRank
      categoryId
    }
  }

  currentUser {
    id
  }
}
`;


export const planMissionMutation = gql`
  mutation PlanMission($goalId: ID!) {
    planMission(goalId: $goalId) {
      id
    }
  }
`;

function Dashboard() {
  const { data, loading, error } = useQuery(dashboardQuery);
  if (loading) {
    return '';
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 50 }}>
      <Paper style={{ padding: 16 }}>
        <Typography variant="h5">My Missions</Typography>
        {data.upcomingMissions.length ? (
          <List>
            {data.upcomingMissions.map(mission => (
              <MissionRow key={mission.id} mission={mission} currentUser={data.currentUser} />
            ))}
          </List>
        ) : (
          <Typography>
            No missions planned yet, pick a mission goal below to get started!
          </Typography>
        )}
      </Paper>

      <Divider style={{ marginTop: 20, marginBottom: 20 }} />

      {data.categories
        .filter(c => c.goals.length)
        .sort((a, b) => a.displayRank - b.displayRank)
        .map(category => (
          <Box style={{ marginBottom: 64 }} key={category.id}>
            <Typography variant="h2">{category.title}</Typography>
            <Grid container>
              {category.goals
                .sort((a, b) => a.displayRank - b.displayRank)
                .map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
            </Grid>
          </Box>
        ))}
    </Container>
  );
}

export function CDN(path) {
  return `${path}`;
}

const cardStyle =  {
    // Provide some spacing between cards
    marginTop: 16,
    marginBottom: 16,
    marginRight:32,
    width: 250,

    // Use flex layout with column direction for components in the card
    // (CardContent and CardActions)
    display: "flex",
    flexDirection: "column",

    // Justify the content so that CardContent will always be at the top of the card,
    // and CardActions will be at the bottom
    justifyContent: "space-between"
};

function GoalCard({goal}) {
  const [planMission, mutationResult] = useMutation(planMissionMutation);

  if (mutationResult && mutationResult.data) {
    return <Redirect to={`/mission/${mutationResult.data.planMission.id}`} />;
  }

  function handlePlanMissionClick() {
    planMission({variables:{goalId: goal.id}});
  }

  return (
    <Grid
      item
      component={Card}
      key={goal.id}
      style={cardStyle}
      onClick={handlePlanMissionClick}
    >
      <CardActionArea>
        <CardMedia
          style={{ height: 140 }}
          image={`/goals/${goal.id}.jpg`}
          title={goal.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {goal.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {goal.shortDescription}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" onClick={handlePlanMissionClick}>
          Plan Mission
        </Button>
      </CardActions>
    </Grid>
  );
}

function MissionRow({ mission, currentUser }) {
  console.log(currentUser);
  const re = /[ @]/;
  const teammateNames = mission.team
    .filter(u => u.id != currentUser.id)
    .map(u => u.name.split(re)[0]).join(", ");

  const missionHasEnded = mission.endTime * 1000 < Date.now();
  let status;
  if (missionHasEnded) {
    status = <Typography>This mission has ended</Typography>
  } else {
    status = (
      <Typography>
        Starts in {timeTillStart(mission)}{" "}
        {mission.team.length > 1 ? teammateNames : ""}
      </Typography>
    );
  }

  return (
    <ListItem divider button component={Link} to={`/mission/${mission.id}`}>
      <ListItemAvatar>
        <Avatar
          variant="square"
          src={`/goals/${mission.goal.id}.jpg`}
        />
      </ListItemAvatar>
      <ListItemText
        primary={mission.goal.title}
        secondary={status}
      />
    </ListItem>
  );
}




export default Dashboard;
