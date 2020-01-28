function createUserList() {
  const connections = {};
  
  return {
    addUser: (user) => {
      if (connections[user.id] && connections[user.id] !== user) {
        console.log('Changing user');
      }
      connections[user.id] = user;
    },
    getUserIds: () => Object.keys(connections),
    getUser: id => connections[id],
  };
}

const UserList = createUserList();

module.exports = UserList;