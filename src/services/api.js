import axios from 'axios';

const api = axios.create({
  baseURL: 'https://assabi-back.herokuapp.com',
});

module.exports = api;