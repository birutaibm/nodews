const knowns = {
  Login: require('./Login'),
  CreateApp: require('./CreateApp'),
};

module.exports = {
  proccess: ({type, data}, ws) => {
    const proccessor = knowns[type];
    if (typeof proccessor === 'function') {
      proccessor(data, ws);
    } else {
      ws.send('{"type":"Error","data":{"message":"Unknown message type"}}');
    }
  }
}