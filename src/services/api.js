import axios from 'axios';

const api = axios.create({
  baseURL: 'https://assabi-back.herokuapp.com',
});

function axiosCatch(stackTrace) {
  return error => {
    let errorMessage = error.message;

    if (error.response) {
      const responseBody = JSON.stringify(error.response.data, null, 2);
      errorMessage = `Request failed with status code ${error.response.status}\n`;
      errorMessage += `Response body: ${responseBody}`;
    }

    error.message = errorMessage;
    error.stack = stackTrace;

    throw error;
  };
}

function getStackTrace() {
  const { stack } = new Error();
  let split = stack.split('\n');

  // Remove the above "new Error" line from the stack trace
  if (split[1].includes('at getStackTrace')) {
    split = [split[0], ...split.splice(2)];
  }

  return split.join('\n');
}

async function get(endpoint, config) {
  const stackTrace = getStackTrace();

  return await api
    .get(endpoint, config)
    .catch(axiosCatch(stackTrace));
}

function withCatch(func, ...params) {
  return func(...params).catch(axiosCatch(stackTrace));
}

async function post(endpoint, data, config) {
  const stackTrace = getStackTrace();

  return await api
    .post(endpoint, data, config)
    .catch(axiosCatch(stackTrace));
}

// api.get = get;
// api.post = post;

module.exports = api;