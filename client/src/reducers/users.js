import {
  ACTION
} from '../constants';

const initialUserState = {
  user: null,
  users: null,
};

const users = (state = initialUserState, action) => {
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
    default:
      return state;
  }
}

export default users;
