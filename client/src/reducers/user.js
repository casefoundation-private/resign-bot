import {
  ACTION
} from '../misc/constants';

const initialUserState = {
  token: null,
  user: null,
  favorites: null,
  needsPasswordReset: false
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
    case ACTION.USER.FAVORITES:
      return Object.assign({},state,{
        'favorites': action.favorites
      });
    case ACTION.USER.ADD_FAVORITE:
      return Object.assign({},state,{
        'favorites': (state.favorites || []).concat([action.submission])
      });
    case ACTION.USER.DELETE_FAVORITE:
      return Object.assign({},state,{
        'favorites': (state.favorites || []).filter((submission) => submission.id !== action.submission_id)
      });
    case ACTION.USER.SET_NEEDS_PASSWORD_RESET:
      return Object.assign({},state,{
        'needsPasswordReset': action.needsPasswordReset
      });
    case ACTION.USER.LOGIN:
    case ACTION.USER.LOGOUT:
      return Object.assign({},initialUserState);
    default:
      return state;
  }
}

export default user;
