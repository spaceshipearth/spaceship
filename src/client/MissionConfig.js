import React from "react";

import gql from "graphql-tag";
import {
  Paper,
  Typography,
  Button,
  Box
} from "@material-ui/core";
import { useMutation } from "react-apollo";
import {useState} from 'react';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { SharePrompt } from "./Share";

import {Step, Stepper, StepLabel, StepContent} from "@material-ui/core";
import { absoluteUrl } from "../shared/util";

export const scheduleMissionMutation = gql`
  mutation ScheduleMission($id: ID!, $startTime: Int!) {
    scheduleMission(id: $id, startTime: $startTime) {
      id
      startTime
    }
  }
`;


const CreateMissionSteps = {
  BECOME_CAPTAIN: 0,
  SCHEDULE_START: 1,
  RECRUIT_TEAM: 2,
};

function getStepContent(step, mission, onDateChange) {
  const dayOfMission = 1;
  const missionDays = 7;
  switch (step) {
    case CreateMissionSteps.BECOME_CAPTAIN:
      return <Button>Cancel mission</Button>;
    case CreateMissionSteps.SCHEDULE_START:
      return <MissionStartPicker mission={mission} onChange={onDateChange} />;
    case CreateMissionSteps.RECRUIT_TEAM:
      return (
        <RecruitModule
          sharingUrl={absoluteUrl({ pathname: `/mission/${mission.id}` })}
        />
      );
    default:
      return "Unknown step";
  }
}
/*    case Steps.START_MISSION:
      return (
        <Box>
          {" "}
          <Typography>The mission has begun!</Typography> <br />{" "}
          <Typography>
            Every day the team will get a reminder email to{" "}
            <b>{mission.goal.shortDescription.toLowerCase()}</b>.
          </Typography>
          <br />
          <Typography>Reply-all with any updates and photos!</Typography>
        </Box>
      );*/

export function MissionCreateStepper({mission}) {
  let initialActiveStep = CreateMissionSteps.SCHEDULE_START;
//  if (mission.startTime && (Date.now() >  mission.startTime * 1000)) {
//    initialActiveStep = Steps.START_MISSION;
//  } else
  if (mission.startTime) {
    initialActiveStep = CreateMissionSteps.RECRUIT_TEAM;
  }
  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const steps = [
      "Sign up to lead the mission",
      "Pick the start date",
      "Recruit your team"
  ];
  const [scheduleMission] = useMutation(scheduleMissionMutation);
  const [proposedStartTime, setProposedStartTime] = useState(new Date(mission.startTime * 1000));

  const handleNext = () => {
    if (activeStep == CreateMissionSteps.SCHEDULE_START) {
      alert(proposedStartTime);
      scheduleMission({
        variables: {
          id: mission.id,
          startTime: proposedStartTime.getTime() / 1000
        }
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
                    {activeStep == CreateMissionSteps.RECRUIT_TEAM ? 'Reschedule Mission' : 'Back'}
                  </Button>
                  {canAdvance() ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  ) : (
                    ""
                  )}
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

function MissionStartPicker({ mission, onChange }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date(mission.startTime * 1000 || nextMonday)
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



function RecruitModule({ sharingUrl }) {
  return (
    <SharePrompt
      sharingUrl={sharingUrl}
      shareMessage={`Hey friends!  I know many of you are concerned about the climate emergency, but like me, unsure about what we can all do.

I found a site that helps groups take the most impactful, research backed, actions for addressing climate change.

Come check it out and join me for a climate mission:

${sharingUrl}

`}
    />
  );
}
