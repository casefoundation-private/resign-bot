import {
  ACTION
} from '../constants';

const initialUserState = {
  token: null,
  user: null
};

const user = (state = initialUserState, action) => {
  switch (action.type) {
    case ACTION.USER.LOGIN_SUCCESS:
      return Object.assign({},state,{
        'token': action.token,
        'user': {
          'id': action.id
        }
      });
    case ACTION.USER.DETAILS:
      return Object.assign({},state,{
        'user': action.user
      });
    case ACTION.USERS.SET:
      if (state.user && action.user && action.user.id === state.user.id) {
        return Object.assign({},state,{
          'user': action.user
        });
      } else {
        return state;
      }
    case ACTION.USER.LOGIN:
    case ACTION.USER.LOGOUT:
      return Object.assign({},initialUserState);
    default:
      return state;
  }
}

export default user;
