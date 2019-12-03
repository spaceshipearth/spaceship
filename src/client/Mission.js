import React from 'react';
import {useState} from 'react';
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
import {absoluteUrl} from '../shared/util';

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

export const scheduleMissionMutation = gql`
  mutation JoinMission($id: ID!, $startTime: Int!) {
    scheduleMission(id: $id, startTime: $startTime) {
      id
      startTime
    }
  }
`;

function RecruitModule({sharingUrl}) {
  return (
    <SharePrompt
    sharingUrl="https://cnn.com/"
      shareMessage={`Hey friends!  I know many of you are concerned about the climate emergency, but like me, unsure about what we can all do.

I found a site that helps groups take the most impactful, research backed, actions for addressing climate change.

Come check it out and join me for a climate mission:

${sharingUrl}

`}
    />
  );
}


function getSteps(mission) {
  function timeTill() {
    const SECONDS_PER_HOUR = 60 * 60;
    const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;
    const deltaSeconds =  mission.startTime - Date.now()/1000;
    return deltaSeconds > SECONDS_PER_DAY ? Math.floor(deltaSeconds/SECONDS_PER_DAY) + ' days' : Math.round(deltaSeconds/SECONDS_PER_HOUR) + ' hours';
  }

  let missionStartStep = "Mission starts";
  if (mission && mission.startTime) {
    if (mission.startTime * 1000 < Date.now()) {
      missionStartStep = "Mission has started";
    } else {
      missionStartStep = "Mission starts in " + timeTill();
    }
  }

  return [
    "Sign up to lead the mission",
    "Pick the start date",
    "Recruit your team",
    missionStartStep,
    "Mission ends"
  ];
}

const Steps = {
  BECOME_CAPTAIN: 0,
  SCHEDULE_START: 1,
  RECRUIT_TEAM: 2,
  START_MISSION: 3
};

function getStepContent(step, mission, onDateChange) {
  const dayOfMission = 1;
  const missionDays = 7;
  switch (step) {
    case Steps.BECOME_CAPTAIN:
      return <Button>Cancel mission</Button>;
    case Steps.SCHEDULE_START:
      return <MissionStartPicker mission={mission} onChange={onDateChange} />;
    case Steps.RECRUIT_TEAM:
      return <RecruitModule sharingUrl={absoluteUrl({pathname:`/mission/${mission.id}`})} />;
    case Steps.START_MISSION:
      return (
        <Box>
          {" "}
          <Typography>The mission has begun!</Typography> <br />{" "}
          <Typography>
            Every day the team will get a reminder email to{" "}
            <b>{mission.goal.shortDescription.toLowerCase()}</b>.
          </Typography>
          <br/>
          <Typography>
          Reply-all with any updates and photos!
          </Typography>
        </Box>
      );
    default:
      return "Unknown step";
  }
}

function MissionProgressStepper({mission}) {
  let initialActiveStep = Steps.SCHEDULE_START;
  if (mission.startTime && (Date.now() >  mission.startTime * 1000)) {
    initialActiveStep = Steps.START_MISSION;
  } else if (mission.startTime) {
    initialActiveStep = Steps.RECRUIT_TEAM;
  }
  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const steps = getSteps(mission);
  const [scheduleMission] = useMutation(scheduleMissionMutation);
  const [proposedStartTime, setProposedStartTime] = useState(new Date(mission.startTime * 1000));

  const handleNext = () => {
    if (activeStep == Steps.SCHEDULE_START) {
      scheduleMission({
        variables: { id: mission.id, startTime: proposedStartTime.getTime()/1000 }
      });
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const canAdvance = () => {
    return activeStep == 1;
  }

  return (
    <div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <div>{getStepContent(index, mission, setProposedStartTime)}</div>
              <div>
                <div>
                  <Button disabled={activeStep === 0} onClick={handleBack}>
                    Back
                  </Button>
                  {canAdvance() ?
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button> : ''}
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset}>Reset</Button>
        </Paper>
      )}
    </div>
  );
}

const nextMonday = "2019-12-18T21:11:54";

function MissionStartPicker({mission, onChange}) {
  const [selectedDate, setSelectedDate] = React.useState(
    new Date((mission.startTime * 1000) || nextMonday)
  );
  const handleDateChange = date => {
    setSelectedDate(date);
    // let parent component know
    onChange(date);
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
            <MissionProgressStepper mission={mission} />
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
