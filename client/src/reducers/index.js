import { combineReducers } from 'redux';
import user from './user';
import users from './users';
import message from './message';
import submissions from './submissions';
import reviews from './reviews';

const reducers = combineReducers({
  user,
  users,
  message,
  submissions,
  reviews
});

export default reducers;
