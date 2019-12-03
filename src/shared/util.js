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