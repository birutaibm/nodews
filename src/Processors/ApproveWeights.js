const Applications = require('../Applications');
const api = require('../services/api');
const {getStackTrace, axiosCatch} = require('../services/apiUtil');

async function getDistance(weights) {
  let stackTrace = getStackTrace();
  const {data: response} = await api.post("/weights", weights).catch(axiosCatch(stackTrace));
  
  const weight = response.id;
  stackTrace = getStackTrace();
  const {data} = await api.get("/weights/"+weight+"/distances").catch(axiosCatch(stackTrace));
  return data;
}

async function process(weight, ws) {
  const {weights} = weight;
  const distances = await getDistance(weights);
  const {group, step} = weights;
  const msg = JSON.stringify({
    type: 'Distances',
    data: {
      group,
      step,
      distances,
    },
  });
  const application = Applications.getApplicationFromGroup(group);
  application.sendToAdmin(msg);
  application.getGroup(group).sendToAll(msg);
}

module.exports = process;