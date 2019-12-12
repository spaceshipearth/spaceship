import React from "react";
import { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { Redirect } from "react-router-dom";

import {  Button, Box
} from "@material-ui/core";
import { Step, Stepper, StepLabel, StepContent } from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { SharePrompt } from "./Share";
import { dashboardQuery } from './Dashboard';
import { absoluteUrl } from "../shared/util";

const scheduleMissionMutation = gql`
  mutation ScheduleMission($id: ID!, $startTime: Int!) {
    scheduleMission(id: $id, startTime: $startTime) {
      id
      startTime
    }
  }
`;

const cancelMissionMutation = gql`
  mutation CancelMission($id: ID!) {
    cancelMission(id: $id) {
      id
      startTime
    }
  }
`;

const MissionPlanningSteps = {
  BECOME_CAPTAIN: 0,
  SCHEDULE_START: 1,
  RECRUIT_TEAM: 2,
};

export function MissionPlanningStepper({mission}) {
  // If we already have a start time, we're recruiting the team
  let initialActiveStep = MissionPlanningSteps.SCHEDULE_START;
  if (mission.startTime) {
    initialActiveStep = MissionPlanningSteps.RECRUIT_TEAM;
  }
  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const [proposedStartTime, setProposedStartTime] = useState(
    new Date(mission.startTime * 1000)
  );

  // Labels for the steps
  const steps = [
      "Sign up to lead the mission",
      "Pick the start date",
      "Recruit your team"
  ];

  // Scheduling and cancelling handlers
  // Scheduling/cancelling both force a dashboard refetch (since filtering is server-side)
  const mutationOptions = {
    refetchQueries: [{ query: dashboardQuery }]
  };
  const [scheduleMission] = useMutation(
    scheduleMissionMutation,
    mutationOptions
  );
  const [cancelMission, cancelMissionResult] = useMutation(
    cancelMissionMutation,
    mutationOptions
  );

  const handleBack = () =>  setActiveStep(activeStep-1);
  const handleNext = () => setActiveStep(activeStep+1);
  const handleScheduleMission = () => {
   scheduleMission({
        variables: {
          id: mission.id,
          startTime: proposedStartTime.getTime() / 1000
        }
    });
    handleNext();
  }
  const handleCancelMission = () => {
    cancelMission({
      variables: {
        id: mission.id,
      }
    });
  };

  // Go home on mission cancel
  if (cancelMissionResult && cancelMissionResult.data) {
    return <Redirect to={`/`} />;
  }

  const sharingUrl = absoluteUrl({ pathname: `/mission/${mission.id}` });

  return (
    <div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index == MissionPlanningSteps.BECOME_CAPTAIN ? (
                <Button>Cancel mission</Button>
              ) : (
                ""
              )}
              {index == MissionPlanningSteps.SCHEDULE_START ? (
                <>
                  <MissionStartPicker
                    mission={mission}
                    onChange={setProposedStartTime}
                  />
                  <Button onClick={handleBack}> Back </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleScheduleMission}
                  >
                    Next
                  </Button>
                </>
              ) : (
                ""
              )}
              {index == MissionPlanningSteps.RECRUIT_TEAM ? (
                <>
                  <SharePrompt
                    sharingUrl={sharingUrl}
                    shareMessage={sharingMessage(sharingUrl)}
                  />
                  <Box>
                    <Button onClick={handleBack}> Reschedule Mission </Button>
                    <Button onClick={handleCancelMission}> Cancel Mission </Button>
                  </Box>
                </>
              ) : (
                ""
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

// Scheduling date picker
const nextMonday = "2019-12-18T00:00:00";
function MissionStartPicker({ mission, onChange }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date(mission.startTime * 1000 || nextMonday)
  );
  const handleDateChange = date => {
    setSelectedDate(date);
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

const sharingMessage = (sharingUrl) => `Hey friends!  I know many of you are concerned about the climate emergency, but like me, unsure about what we can all do.\n
I found a site that helps groups take the most impactful, research backed, actions for addressing climate change.\n
Come check it out and join me for a climate mission:\n
${sharingUrl}`;
