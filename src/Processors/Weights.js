const Applications = require('../Applications');

function process(data, ws) {
  Applications.getApplicationFromGroup(data.weights.group)
    .sendToAdmin(JSON.stringify({
      type: 'Weights',
      data,
    }));
}

module.exports = process;