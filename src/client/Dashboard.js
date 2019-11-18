import React from 'react';
import EarthJpg from '../../public/earth.jpg';
import './Home.css';
import gql from 'graphql-tag';
import { Container,  Grid, Card, CardActionArea, CardContent, CardHeader, CardMedia, CardActions, Typography, Button, Box } from '@material-ui/core';
import { useQuery, useMutation } from 'react-apollo';

export const goalsQuery = gql`
  query Missions {
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
      }
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
  const {data, loading, error} = useQuery(goalsQuery);
  if (loading) {
    return '';
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 50 }}>
      {data.categories.filter(c=>c.goals.length).map(category => (
        <Box style={{marginBottom:64}}>
          <Typography variant="h2" key={category.id}>
            {category.title}
          </Typography>
          <Grid container>
            {category.goals.map(goal => (
              <GoalCard goal={goal} />
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
  const [planMission, {data}] = useMutation(planMissionMutation);

  function handlePlanMissionClick() {
    planMission({variables:{goalId: goal.id}});
  }
  console.log(data);

  return (
    <Grid item component={Card} key={goal.id} style={cardStyle}>
      <CardActionArea>
        <CardMedia
          style={{ height: 140 }}
          image="https://timedotcom.files.wordpress.com/2019/03/kitten-report.jpg"
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
        <Button size="small" color="secondary">
          Learn More
        </Button>
        <Button size="small" color="primary" onClick={handlePlanMissionClick}>
          Plan Mission
        </Button>
      </CardActions>
    </Grid>
  );
}

export default Dashboard;
