describe('Login message', () => {
  let server = undefined;
  const clients = {};
  const Utils = require('./Utils')

  beforeAll(done => {
    server = require('../../src/server');
    server.listen(process.env.PORT || 8999, () => {
      const semaphore = Utils.semaphore(2, done);
      function createClient(key) {
        clients[key] = new WebSocket('ws://localhost:8999');
        clients[key].onopen = () => semaphore.add();
        clients[key].sendJSON = json => clients[key].send(JSON.stringify(json));
        clients[key].onmessage = ({data}) => {
          const msg = JSON.parse(data);
          expect(typeof msg).toBe('object');
          const event = clients[key]['on'+msg.type];
          expect(typeof event).toBe('function');
          event(msg.data);
        };
      }
      createClient('actor');
      createClient('admin');
    });
  });

  afterAll(done => {
    if (server) {
      server.on('close', () => {
        Object.values(clients).forEach(client => client.close());
        done();
      });
      server.close(() => {
        server.unref();
        //process.exit(); //Uncomment if your process is not stopped naturally
      });
    }
  });

  it('Should return unathorized for wrong login', done => {
    Utils.tempClient(
      JSON.stringify(Utils.wrongLogin),
      ({data}) => {
        const msg = JSON.parse(data);
        expect(typeof msg).toBe('object');
        expect(msg.type).toBe('Error');
        expect(msg.data.message).toBe('Unathorized Access');
      },
      done);
  }, 30000);

  it('Should create an admin User for email "solangegarcia@fearp.usp.br"', done => {
    clients.admin.sendJSON(Utils.adminLogin);
    function verify() {
      if (Utils.getAdminId()) {
        done();
      } else {
        setTimeout(verify, 500);
      }
    }
    verify();
  }, 30000);

  it('Should return AppInfo when admin send CreateApp message', done => {
    let appName = undefined;
    function testMessage(data) {
      expect(data.name).toBe(appName);
      done();
    }
    async function sendCreateAppMessage() {
      const createApp = await Utils.getCreateAppMessage();
      appName = createApp.data.name;
      clients.admin.sendJSON(createApp);
    }
    clients.admin.onAppInfo = testMessage;
    sendCreateAppMessage();
  }, 30000);

  it('Should return AppInfo when user log in existing application', done => {
    let appName = undefined;
    let actorName = undefined;
    const semaphore = Utils.semaphore(2, done);
    function testActorMessage(data) {
      expect(data.name).toBe(appName);
      semaphore.add();
    }
    function testAdminMessage(data) {
      expect(data.actorName).toBe(actorName);
      semaphore.add();
    }
    async function sendUserLogin() {
      const userLogin = await Utils.getUserLoginMessage();
      actorName = userLogin.data.login;
      appName = userLogin.data.password;
      clients.actor.sendJSON(userLogin);
    }
    clients.actor.onAppInfo = testActorMessage;
    clients.admin.onNewActor = testAdminMessage;
    sendUserLogin();
  }, 30000);

  it('Should foward to admin any ParticipationIntension received from actor', done => {
    let pi = undefined;
    clients.admin.onParticipationIntension = received => {
      expect(received).toEqual(pi.data);
      done();
    };
    async function sendParticipationIntension() {
      pi = await Utils.getParticipationIntensionMessage();
      clients.actor.sendJSON(pi);
    }
    sendParticipationIntension()
  });
});