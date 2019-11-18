import React from 'react';
import EarthJpg from '../../public/earth.jpg';
import './Home.css';
import gql from 'graphql-tag';
import { Avatar,Container, ListItemText,  Grid, Card, Paper, CardActionArea, CardContent, CardHeader, CardMedia, CardActions, Typography, Button, Box } from '@material-ui/core';
import { useQuery, useMutation } from 'react-apollo';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";

import DateFnsUtils from "@date-io/date-fns";


export const missionQuery = gql`
  query Mission($id: ID!) {
    mission(id: $id) {
      id
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
  }
`;


function Mission({match}) {

 // The first commit of Material-UI
  const [selectedDate, setSelectedDate] = React.useState(new Date('2019-08-18T21:11:54'));

  const handleDateChange = date => {
    setSelectedDate(date);
  };


  const { data, loading, error } = useQuery(missionQuery, {variables: {id: match.params.missionId}});
  if (loading) {
    return '';
  }
  const mission = data.mission;

  return (
    <Container maxWidth="md">
      <Card key={mission.goal.id}>
        <CardMedia
          style={{ height: 140 }}
          image="https://timedotcom.files.wordpress.com/2019/03/kitten-report.jpg"
          title={mission.goal.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {mission.goal.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {mission.goal.shortDescription}
          </Typography>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Mission start date"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </MuiPickersUtilsProvider>
        </CardContent>
        <CardActions></CardActions>
      </Card>
      <Grid container>
        <Grid item xs={9}>
          <Paper>hello</Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper>
            hello

          </Paper>
        </Grid>
      </Grid>
      <Paper></Paper>
    </Container>
  );
}

export default Mission;
