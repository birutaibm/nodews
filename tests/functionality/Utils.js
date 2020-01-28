const userList = require('../../src/UserList');
const Applications = require('../../src/Applications');

const adminLogin = {
  type: "Login",
  data: {
    login: "solangegarcia@fearp.usp.br",
    password: "1234"
  },
};

const wrongLogin = {
  type: "Login",
  data: {
    login: "rafaelarantes@usp.br",
    password: "dontKnow"
  },
};


function getAdminId() {
  let adminId = undefined;
  userList.getUserIds().forEach(id => {
    if (userList.getUser(id).name === adminLogin.data.login) {
      adminId = id;
    }
  });
  return adminId;
}

async function retryUntilSuccess(getFunction, timeout=100) {
  const promise = new Promise((resolve, reject) => {
    function getValue() {
      const value = getFunction();
      if (value) {
        resolve(value)
      } else {
        setTimeout(getValue, timeout);
      }
    }
    getValue();
  });
  const result = await promise;
  return result;
}

async function getCreateAppMessage() {
  const admin = await retryUntilSuccess(getAdminId);
  const name = 'teste' + Applications.getApplicationIds().length;
  const createApp = {
    scenario: 1,
    name,
    admin,
    phases: {
      stakeholders: 3,
      mix: 2,
    },
  };
  return {
    type: 'CreateApp',
    data: createApp,
  };
}

async function getUserLoginMessage() {
  function getApplicationName() {
    const ids = Applications.getApplicationIds();
    if (ids.length) {
      return Applications.getApplication(ids[0]).info.name;
    } else {
      return false;
    }
  }
  const password = await retryUntilSuccess(getApplicationName);
  const userLogin = {
    type: "Login",
    data: {
      login: "birutaibm@gmail.com",
      password,
    },
  };
  return userLogin;
}

module.exports = {
  adminLogin,
  wrongLogin,
  getUserLoginMessage,
  getAdminId,
  getCreateAppMessage,
}