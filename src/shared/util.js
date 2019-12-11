import url from "url";

export function absoluteUrl({pathname, query}) {
  if (typeof window != "undefined" && window.location) {
    return window.location.origin + pathname;
  }
  return url.format({
    protocol: process.env.APP_PROTOCOL,
    hostname: process.env.APP_HOST,
    port: process.env.APP_PORT ? process.env.APP_PORT : '',
    pathname,
    query,
  });
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export function missionDay(mission) {
  const startTime = new Date(mission.startTime * 1000);
  return dateDiffInDays(startTime, new Date()) + 1;
}