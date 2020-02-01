const Applications = require('../Applications');

function process(intension, ws) {
  Applications.getApplication(intension.application)
      .sendToAdmin(JSON.stringify({
        type: 'ParticipationIntension',
        data: intension,
      }));
}

module.exports = process;