const knowns = {
  Login: require('./Login'),
  CreateApp: require('./CreateApp'),
  ParticipationIntension: require('./ParticipationIntension'),
  ParticipationApproval: require('./ParticipationApproval'),
};
const unknown = JSON.stringify({
  type: 'Error',
  data: {
    message: 'Unknown message type',
  },
});

module.exports = {
  proccess: ({type, data}, ws) => {
    const proccess = knowns[type];
    if (typeof proccess === 'function') {
      proccess(data, ws);
    } else {
      ws.send(unknown);
    }
  }
}