const userList = require('./UserList');

function createApplications() {
  const applications = {};
  
  return {
    addApplication: (application, admin) => {
      applications[application.id] = {
        info: application,
        admin,
        groups: {},
        sendToAdmin: msg => {
          const user = userList.getUser(admin);
          if (user) {
            user.send(msg);
          }
        },
        getGroup: groupId => groups[groupId],
      };
    },
    getApplicationIds: () => Object.keys(applications),
    getApplication: id => applications[id],
    addGroup: (id, groupId, users) => applications[id].groups[groupId] = {
      users,
      sendToAll: message => users.forEach(userId => {
        const user = userList.getUser(userId);
        if (user) {
          user.send(message);
        }
      }),
    },
  };
}

const Applications = createApplications();

module.exports = Applications;