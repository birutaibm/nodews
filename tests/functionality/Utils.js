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

function getActor() {
  let actor;
  userList.getUserIds().forEach(id => {
    if (userList.getUser(id).name !== adminLogin.data.login) {
      actor = userList.getUser(id);
    }
  });
  return actor;
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
      stakeholder: 3,
      mix: 2,
    },
  };
  return {
    type: 'CreateApp',
    data: createApp,
  };
}

function getApplicationInfo() {
  const ids = Applications.getApplicationIds();
  if (ids.length) {
    const application = Applications.getApplication(ids[ids.length-1]);
    if (userList.getUser(application.admin)) {
      return application.info;
    }
  }
  return false;
}

async function getUserLoginMessage() {
  const app = await retryUntilSuccess(getApplicationInfo);
  const userLogin = {
    type: "Login",
    data: {
      login: "birutaibm@gmail.com",
      password: app.name,
    },
  };
  return userLogin;
}

function semaphore(size, callback) {
  let filled = 0;
  function add(qtd=1) {
    filled += qtd;
    if (filled === size) {
      filled = 0;
      callback();
    }
  }
  return {add};
}

function tempClient(msgToSend, testOnMsg, onClose) {
  const client = new WebSocket('ws://localhost:8999');
  client.onopen = () => client.send(msgToSend);
  client.onmessage = param => {
    testOnMsg(param);
    client.close();
  };
  client.onclose = () => onClose();
}

async function getParticipationIntensionMessage() {
  const app = await retryUntilSuccess(getApplicationInfo);
  const actor = await retryUntilSuccess(getActor);
  const group = app.phases.find(phase => phase.name === 'stakeholder').groups[0];
  const character = group.characters[0];
  return {
    type: 'ParticipationIntension',
    data: {
      application: app.id,
      actorId: actor.id,
      actorName: actor.name,
      groupId: group.id,
		  groupName: group.name,
		  characterId: character.id,
		  characterName: character.name,
    },
  };
}

function getApplicationWithGroup() {
  const appId = Applications.getApplicationIds()
    .find(id => {
      const groups = Applications.getApplication(id).groups
      return Object.keys(groups).length > 0;
    });
  if (appId) {
    return Applications.getApplication(appId);
  } else {
    return false;
  }
}

function generateRandomNumbers(qtd) {
  const rand = [];
  let sum = 0;
  for (let index = 0; index < qtd; index++) {
    rand[index] = Math.random();
    sum += rand[index];
  }
  const factor = 1.0/sum;
  return rand.map(value => factor * value);
}

function generateWeightDimComponents(ids) {
  const values = generateRandomNumbers(ids.length);
  return ids.map((id, index) => {
    return {
      weightableId: id,
      weightableType: 'DIM',
      value: values[index],
    };
  });
}

function generateWeightCriComponents(ids) {
  const values = generateRandomNumbers(ids.length);
  return ids.map((id, index) => {
    return {
      weightableId: id,
      weightableType: 'CRI',
      value: values[index],
    };
  });
}

function generateWeightComponents(application) {
  const dimensions = application.info.scenario.dimensions;
  let components = generateWeightDimComponents(dimensions.map(dim => dim.id));
  dimensions.forEach(dim =>
    components = [
      ...components,
      ...generateWeightCriComponents((dim.criteria.map(cri => cri.id))),
    ]
  );
  return components;
}

async function getWeightData() {
  const application = await retryUntilSuccess(getApplicationWithGroup);
  const group = Object.keys(application.groups)[0];
  const actors = application.groups[group];
  const userId = actors[0];
  const components = generateWeightComponents(application);
  const weights = {
    group,
    step: 1,
    components,
  };
  return {userId, weights};
}

module.exports = {
  adminLogin,
  wrongLogin,
  getUserLoginMessage,
  getAdminId,
  getCreateAppMessage,
  semaphore,
  tempClient,
  getParticipationIntensionMessage,
  getWeightData,
}