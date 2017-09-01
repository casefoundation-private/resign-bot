import {
  ACTION
} from '../misc/constants';

const initialUsersState = {
  user: null,
  users: null,
};

const users = (state = initialUsersState, action) => {
  switch (action.type) {
    case ACTION.USERS.SET:
      return Object.assign({},state,{
        'users': action.users || state.users,
        'user': action.user || state.user
      });
    case ACTION.USERS.SET_USER_PROP:
      return Object.assign({},state,{
        'user': Object.assign({},state.user,action.updates)
      });
    case ACTION.USER.LOGOUT:
      return initialUsersState;
    default:
      return state;
  }
}

export default users;
