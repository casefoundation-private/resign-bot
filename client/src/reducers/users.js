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
      const userList = action.users || state.users;
      if (action.user && userList) {
        const userIndex = userList.find((_user) => _user.id === action.user.id);
        userList[userIndex] = action.user;
      }
      return Object.assign({},state,{
        'users': userList,
        'user': action.user || state.user
      });
    case ACTION.USERS.SET_USER_PROP:
      return Object.assign({},state,{
        'user': Object.assign({},state.user,action.updates)
      });
    case ACTION.USERS.SET_NOTIFICATION_PREFERENCE:
      const newNotificationPreferences = Object.assign({},state.user.notificationPreferences,{}) || {};
      newNotificationPreferences[action.property] = action.value;
      return Object.assign({},state,{
        'user': Object.assign({},state.user,{
          'notificationPreferences': newNotificationPreferences
        })
      });
    case ACTION.USER.LOGOUT:
      return initialUsersState;
    default:
      return state;
  }
}

export default users;
