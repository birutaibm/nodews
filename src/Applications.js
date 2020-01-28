function createApplications() {
  const applications = {};
  
  return {
    addApplication: (application, admin) => {
      applications[application.id] = {
        info: application,
        admin,
        groups: {},
        sendToAdmin: msg => admin.send(msg),
        getGroup: groupId => groups[groupId],
      };
    },
    getApplicationIds: () => Object.keys(applications),
    getApplication: id => applications[id],
    addGroup: (id, groupId, users) => applications[id].groups[groupId] = {
      users,
      sendToAll: message => users.forEach(user => user.send(message)),
    },
  };
}

const Applications = createApplications();

module.exports = Applications;