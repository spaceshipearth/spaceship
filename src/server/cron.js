import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

import cron from 'node-cron';
import * as Sentry from '@sentry/node';
import {sendMissionEmails} from './mission-emails';

function reportingErrors(handler) {
  return async () => {
    try {
      await handler();
    } catch (error) {
      console.error(error);
      Sentry.withScope(scope => {
        Sentry.captureException(`CronError: ${error.message}`);
      });
    }
  };
}

const cronConfig = [
  ['15 19 * * *', sendMissionEmails], // 7m PST (8am PDT)
];

let scheduledJobs = [];
if (process.env.IS_WORKER_CLASS == 'true') {
  cronConfig.forEach(config => {
    scheduledJobs.push(cron.schedule(config[0], reportingErrors(config[1])));
  });
}

// for HMR in dev only
export function shutdown() {
  if (process.env.IS_WORKER_CLASS == 'true') {
    scheduledJobs.forEach(job => {
      job.destroy();
    });
  }
}
