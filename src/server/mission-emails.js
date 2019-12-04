import * as models from "./db/models";
import * as email from './email';


export async function sendMissionEmails() {
  const now = Date.now();
  const ongoingMissions = await models.Mission.findAll({
    where:{
      startTime: { [models.Sequelize.Op.lt]: now },
      endTime:  { [models.Sequelize.Op.lt]: now + 7 * 24 * 60 * 60 * 1000 }
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
  const users = await findTeamUsers(mission);
  const goal = await models.Goal.findByPk(mission.goalId);

  return email.send({
    to:users.map(u=>u.email).join(","),
    subject:`Spaceship Earth: ${goal.title} update`,
    text: `Morning,

Another glorious day of saving the planet is ahead.  Remember to ${goal.shortDescription.toLowerCase()} today!

As you go through your day, reply to this email with photos and updates.

<3
The Spaceship Earth Crew
`});
}