const api = require('../services/api');
const Applications = require('../Applications');
const UserList = require('../UserList');

async function process(createApp, ws) {
  const { data } = await api.post('/applications', createApp);
  const appInfo = JSON.stringify({
    type: 'AppInfo',
    data,
  });
  Applications.addApplication(data, UserList.getUser(createApp.admin));
  Applications.getApplication(data.id).sendToAdmin(appInfo);
}

module.exports = process;