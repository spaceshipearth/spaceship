const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  modify(config, { target, dev }, webpack) {
    console.log(config);
    const appConfig = config; // stay immutable here
    if (!dev) {
      appConfig['output']['publicPath'] = 'https://d1h6ehl1pyzsu8.cloudfront.net/';
    }
    if (target == 'web') {
      if (appConfig['entry']['client'].pop) {
        appConfig['entry']['client'].pop();
        appConfig['entry']['client'].push(resolveApp('src/client/client'));
      } else {
        appConfig['entry']['client'] = resolveApp('src/client/client');
      }
    } else if (target == 'node') {
      appConfig['node']['__dirname'] = true;
      appConfig['node']['__filename'] = true;
      appConfig['entry'].pop();
      appConfig['entry'].push(resolveApp('src/server'));
    } else {
    }

    return appConfig;
  },
};
