const Applications = require('../Applications');

function process(weight, ws) {
  const application = Applications.getApplicationIds().filter(appId => {
    const {groups} = Applications.getApplication(appId);
    return Object.keys(groups).includes(weight.group)
  });
  Applications.getApplication(application)
      .sendToAdmin(JSON.stringify({
        type: 'Weight',
        data: weight,
      }));
}

module.exports = process;