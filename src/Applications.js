const userList = require('./UserList');

function createApplications() {
  const applications = {};

  function createApplicationGroup(users) {
    const sendToAll = message => users.forEach(userId => {
      const user = userList.getUser(userId);
      if (user) {
        user.send(message);
      }
    });

    return {users, sendToAll}
  }

  function createApplication(info, admin) {
    const application = {
      info,
      admin,
      groups: {}
    };
    application.sendToAdmin = msg => {
      const user = userList.getUser(application.admin);
      if (user) {
        user.send(msg);
      }
    };
    application.getGroup = groupId => application.groups[groupId];
    application.addGroup = (groupId, users) =>
      application.groups[groupId] = createApplicationGroup(users);
    return application;
  }
  
  return {
    addApplication: (application, admin) => {
      applications[application.id] = createApplication(application, admin);
    },
    getApplicationIds: () => Object.keys(applications),
    getApplication: id => applications[id],
    getApplicationFromGroup: groupId => {
      return Object.values(applications).find(app => app.groups[groupId]);
    },
    addGroup: (id, groupId, users) => applications[id].addGroup(groupId, users),
  };
}

const Applications = createApplications();

module.exports = Applications;