const userList = require('../UserList');
const Applications = require('../Applications');
const api = require('../services/api');

function getOrDefault(object, key, defaultValue={}) {
  if (!object[key]) {
    object[key] = defaultValue;
  }
  return object[key];
}

function joinArrays(arr1=[], arr2=[]) {
  const size = arr1.length;
  const result = [];
  for (let i = 0; i < size; i++) {
    result[i] = {
      ...arr1[i],
      ...arr2[i],
    };
  }
  return result;
}
async function getSuccessfullyApprovedParticipation(applications) {
  const approvedDTOs = [];
  Object.values(applications).forEach(groups => {
    Object.keys(groups).forEach(groupId => {
      groups[groupId].interpretations.ids.forEach(interpretation => {
        approvedDTOs.push({
          group: groupId,
          interpretation,
        });
      });
    });
  });
  const {data} = await api.post('/participations', approvedDTOs);
  const successes = {};
  data.successes.forEach(participation => successes[participation.interpretation.actor.id] = participation.id);
  return successes;
}

function changeGroupExtruture(group, successes) {
  const interp = group.interpretations;
  delete group.interpretations;
  
  const participants = {};
  const participations = joinArrays(interp.ids, interp.names)
    .filter(obj => 
      Object.keys(successes).includes(obj.actor+'')
    ).map(p => {
      participants[p.actorName] = p.characterName;
      return {
        id: successes[p.actor],
        actor: Number(p.actor),
      };
    });
  group.participants = participants;
  group.participations = participations;
}

async function process({approved}, ws) {
  const applications = {};
  approved.forEach(element => {
    const application = getOrDefault(applications, element.application);
    const group = getOrDefault(application, element.groupId, {
      name: element.groupName,
      interpretations: {
        ids: [],
        names: [],
      },
    });
    group.interpretations.ids.push({
      actor: element.actorId,
      character: element.characterId,
    });
    group.interpretations.names.push({
      actorName: element.actorName,
      characterName: element.characterName,
    });
  });
  const successes = await getSuccessfullyApprovedParticipation(applications);
  Object.values(applications).forEach(groups => {
    Object.keys(groups).forEach(groupId => {
      const group = groups[groupId];
      changeGroupExtruture(group, successes);
    });
  });
  Object.keys(applications).forEach(application => {
    Object.keys(applications[application]).forEach(groupId => {
      const group = applications[application][groupId];
      const users = group.participations.map(p => p.actor);
      Applications.addGroup(Number(application), Number(groupId), users);
    });
  });
  Object.values(applications).forEach(groups => {
    Object.keys(groups).forEach(gid => {
      const group = groups[gid];
      const groupId = Number(gid);
      const groupName = group.name;
      const participants = group.participants;
      group.participations.forEach(p => {
        let {id, actor} = p;
        actor = userList.getUser(actor);
        const msg = JSON.stringify({
          type: 'ParticipationApproved',
          data: {
            groupId,
            groupName,
            participants,
            id,
          },
        });
        actor.send(msg);
      });
    });
  });
}

module.exports = process;