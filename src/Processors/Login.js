const userList = require('../UserList');
const Applications = require('../Applications');
const api = require('../services/api');

async function couldLogin(login) {
  try {
    const { data } = await api.post('/login', login);
    return data;
  } catch (error) {
    return false;
  }
}

function processAdmin(login, logged, ws) {
  if (logged.adminId) {
    const admin = {
      id: logged.adminId,
      name: login.login,
      send: msg => ws.send(msg),
    };
    userList.addUser(admin);
    logged.applications.forEach(app => Applications.addApplication(app, admin));

    return true;
  } else {
    return false;
  }
}

function processActor(login, logged, ws) {
  if (logged.actor && logged.appId) {
    const actor = {
      id: logged.actor,
      name: login.login,
      send: msg => ws.send(msg),
    };
    userList.addUser(actor);
    const app = Applications.getApplication(logged.appId);
    const appInfo = JSON.stringify({
      type: 'AppInfo',
      data: app.info,
    });
    ws.send(appInfo);
    app.sendToAdmin(JSON.stringify({
      type: 'NewActor',
      data: {
        actorId: actor.id,
        actorName: actor.name,
      },
    }));
    
    return true;
  } else {
    return false;
  }
}

async function process(login, ws) {
  const logged = await couldLogin(login);
  if (logged &&
     (processAdmin(login, logged, ws) || processActor(login, logged, ws))) {
      return true;
  } else {
    const response = {
      type: 'Error',
      data: {
        message: 'Unathorized Access',
      },
    };
    ws.send(JSON.stringify(response));
  }
}

module.exports = process;