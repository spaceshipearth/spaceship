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
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box
} from "@material-ui/core";
import { useQuery, useMutation } from 'react-apollo';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import AvatarPng from "../../public/avatar.png";
import DateFnsUtils from "@date-io/date-fns";
import { Signup as WithSignup } from "./Signin";
import {SharePrompt} from './Share';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';

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


function RecruitModule() {
  return <SharePrompt shareMessage="Join my mission!" />;
}


function getSteps() {
  return [
    "Sign up to lead the mission",
    "Pick the start date",
    "Recruit your team",
    "Mission starts in 3 days and 3 hours",
    "Mission ends"
  ];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return `Cancel mission?`;
    case 1:
      return <MissionStartPicker/>
    case 2:
      return <RecruitModule/>;
    case 3:
      return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
    default:
      return "Unknown step";
  }
}

function MissionProgressStepper({startTime}) {
  const [activeStep, setActiveStep] = React.useState(startTime ? 2 : 1);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div >
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <div>{getStepContent(index)}</div>
              <div>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset}>
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
}

function MissionStartPicker() {
  const [selectedDate, setSelectedDate] = React.useState(
    new Date("2019-08-18T21:11:54")
  );
  const handleDateChange = date => {
    setSelectedDate(date);
  };
  return (
    <Box>
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
    </Box>
  );
}
function Mission({match}) {

  const [joinTeamMutation] = useMutation(joinMissionMutation);


  function handleJoinClick () {
    joinTeamMutation({variables:{id:data.mission.id}});
  }

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
          <br />
          <Typography
            variant="body1"
            color="textSecondary"
            component="p"
            dangerouslySetInnerHTML={{ __html: mission.goal.longDescription }}
          />
        </CardContent>
        <CardActions></CardActions>
      </Card>
      <Grid container style={{ marginTop: 10 }} spacing={3}>
        <Grid item xs={8}>
          <Paper style={{ padding: 16 }}>
            <Typography gutterBottom variant="h6">
              Mission Progress
            </Typography>
            <MissionProgressStepper />
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper style={{ padding: 16 }}>
            <Typography gutterBottom variant="h6">
              Team
            </Typography>
            <WithSignup isSignedIn={data.currentUser}>
              <Button
                size="small"
                color="secondary"
                onClick={handleJoinClick}
              >
                Join
              </Button>
            </WithSignup>
            <TeamUserList users={mission.team} />
          </Paper>
        </Grid>
      </Grid>
      <Paper></Paper>
    </Container>
  );
}

  // Render all the items
function TeamUserList({users}) {
  return (
    <List> {
      users.map((user, idx) => (
        <ListItem
          button
          component={Link}
          to={`/profile/${user.id}`}
          key={user.id}
          divider={idx < users.length - 1}
        >
          <ListItemAvatar>
            <Avatar
              alt={user.name}
              imgProps={{ width: "40", height: "40" }}
              src={user.photoUrl || AvatarPng}
            />
          </ListItemAvatar>

          <ListItemText
            primary={user.name}
          />
        </ListItem>
    )) }
  </List>);

};


export default Mission;
