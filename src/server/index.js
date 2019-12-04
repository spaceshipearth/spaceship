import http from 'http';

let app = require('./server').default;
let cron = require("./cron");

const server = http.createServer(app);

let currentApp = app;
let currentCron = cron;

server.listen(process.env.PORT || 3000, error => {
  if (error) {
    console.log(error);
  }

  console.log("🚀 started");
});

if (module.hot) {
  console.log("✅  Server-side HMR Enabled!");

  module.hot.accept("./server", () => {
    console.log("🔁  HMR Reloading `./server`...");

    try {
      app = require("./server").default;
      server.removeListener("request", currentApp);
      server.on("request", app);
      currentApp = app;
    } catch (error) {
      console.error(error);
    }
  });

  module.hot.accept("./cron", () => {
    console.log("🔁  HMR Reloading `./cron`...");

    cron = require("./cron");
    try {
      currentCron.shutdown();
      currentCron = cron;
    } catch (error) {
      console.error(error);
    }
  });
}
