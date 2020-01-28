describe('Login message', () => {
  let server = undefined;
  const clients = [];
  const Utils = require('./Utils')

  beforeAll(done => {
    server = require('../../src/server');
    server.listen(process.env.PORT || 8999, () => {
      function createClient() {
        const client = new WebSocket('ws://localhost:8999');
        client.onopen = () => {
          clients.push(client);
          if (clients.length === 2) {
            done();
          }
        };
      }
      createClient();
      createClient();
    });
  });

  afterAll(done => {
    if (server) {
      server.on('close', () => {
        clients.forEach(client => client.close());
        done();
      });
      server.close(() => {
        server.unref();
        //process.exit(); //Uncomment if your process is not stopped naturally
      });
    }
  });

  it('Should return unathorized for wrong login', done => {
    clients[1].onmessage = ({data}) => {
      const msg = JSON.parse(data);
      expect(typeof msg).toBe('object');
      expect(msg.type).toBe('Error');
      expect(msg.data.message).toBe('Unathorized Access');
      done();
    };
    clients[1].send(JSON.stringify(Utils.wrongLogin));
  }, 30000);

  it('Should create an admin User for email "solangegarcia@fearp.usp.br"', done => {
    clients[0].send(JSON.stringify(Utils.adminLogin));
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
    async function testMessage({data}) {
      const msg = JSON.parse(data);
      expect(typeof msg).toBe('object');
      expect(msg.type).toBe('AppInfo');
      expect(msg.data.name).toBe(appName);
      done();
      
    }
    async function sendCreateAppMessage() {
      const createApp = await Utils.getCreateAppMessage();
      appName = createApp.data.name;
      clients[0].send(JSON.stringify(createApp));
    }
    clients[0].onmessage = testMessage;
    sendCreateAppMessage();
  }, 30000);

  it('Should return AppInfo when user log in existing application', done => {
    let appName = undefined;
    let actorName = undefined;
    let tested = 0;
    async function testActorMessage({data}) {
      const msg = JSON.parse(data);
      expect(typeof msg).toBe('object');
      expect(msg.type).toBe('AppInfo');
      expect(msg.data.name).toBe(appName);
      if (tested < 1) {
        tested++;
      } else {
        done();
      }
    }
    async function testAdminMessage({data}) {
      const msg = JSON.parse(data);
      expect(typeof msg).toBe('object');
      expect(msg.type).toBe('NewActor');
      expect(msg.data.actorName).toBe(actorName);
      if (tested < 1) {
        tested++;
      } else {
        done();
      }
    }
    async function sendUserLogin() {
      const userLogin = await Utils.getUserLoginMessage();
      actorName = userLogin.data.login;
      appName = userLogin.data.password;
      clients[1].send(JSON.stringify(userLogin));
    }
    clients[1].onmessage = testActorMessage;
    clients[0].onmessage = testAdminMessage;
    sendUserLogin();
  }, 30000);
});