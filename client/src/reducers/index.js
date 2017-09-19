import { combineReducers } from 'redux';
import user from './user';
import users from './users';
import message from './message';
import submissions from './submissions';
import reviews from './reviews';
import config from './config';
import notifications from './notifications';

const reducers = combineReducers({
  user,
  users,
  message,
  submissions,
  reviews,
  config,
  notifications
});

export default reducers;
