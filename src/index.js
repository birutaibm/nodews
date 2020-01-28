const server = require('./server');

server.listen(process.env.PORT || 8999, () => {
  console.log('BEFORE');
});
