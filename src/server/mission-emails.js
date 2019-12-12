import * as models from "./db/models";
import * as email from './email';
import {missionDay} from './../shared/util';

export async function sendMissionEmails() {
  const now = Date.now();
  const ongoingMissions = await models.Mission.findAll({
    where:{
      startTime: { [models.Sequelize.Op.lt]: now },
      endTime:  { [models.Sequelize.Op.lt]: now + 8 * 24 * 60 * 60 * 1000 } // 1 day for wrap up
    }
  });
  console.log(ongoingMissions);

  for (let i=0; i<ongoingMissions.length; i++) {
    await sendDailyEmail(ongoingMissions[i]);
  }
}

async function findTeamUsers(mission) {
  const userMissions = await models.UserMission.findAll({
    where: { missionId:mission.id }
  });
  const captain = await models.User.findByPk(mission.captainId);
  const team = await models.User.findAll({
    where: { id: userMissions.map(um => um.userId) }
  });
  team.push(captain);
  return team;
}

async function sendDailyEmail(mission) {
  const goal = await models.Goal.findByPk(mission.goalId);
  const currentDay = missionDay(mission, true /* inMS */);
  console.log(currentDay);
  if (currentDay == 1) {
    sendMissionTeamEmail(mission,
      `Spaceship Earth: ${goal.title} mission kick-off!`,
      `Morning,\n\n
The mission is on!  A glorious day of saving the planet is ahead.  Remember to ${goal.shortDescription.toLowerCase()} today!\n
As you go through your day, reply to this email with photos and updates.\n
<3
The Spaceship Earth Crew`);
    } else if (currentDay < 8) {
    sendMissionTeamEmail(mission,
      `Spaceship Earth: ${goal.title} check-in!`,
      `Morning,\n\n
Another glorious day of saving the planet is ahead.  Remember to ${goal.shortDescription.toLowerCase()} today!\n
As you go through your day, reply to this email with photos and updates.\n
<3
The Spaceship Earth Crew`);

  } else if (currentDay == 8) {
    sendMissionTeamEmail(mission,
      `Spaceship Earth: ${goal.title} mission wrap-up!`,
      `Morning,\n\n
You have completed the mission!
How did ${goal.shortDescription.toLowerCase()} go?\n  Was it harder than you thought it would be? Easier? Did you learn something during the mission?
Today is a great day to post on social media about the mission and to reply to this email any final thoughts?.\n
<3
The Spaceship Earth Crew`);
  }
}

async function sendMissionTeamEmail(mission, subject, body) {
  const users = await findTeamUsers(mission);
  return email.send({
    to: users.map(u => u.email).join(","),
    subject,
    text: body}
  );
}