import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';

export const loadUsers = () => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.USERS.SET,
      users: []
    });
    authenticatedRequest(dispatch,getState,'/api/user','GET',null,(users) => {
      dispatch({
        type: ACTION.USERS.SET,
        users
      });
    });
  }
}

export const setActiveUser = (user) => {
  return {
    type: ACTION.USERS.SET,
    user
  }
}

export const loadUser = (userId) => {
  return (dispatch,getState) => {
    let user = getState().users.users && getState().users.users.find((user) => {
      return user.id === userId;
    });
    if (!user && getState().users.user && userId === getState().users.user.id) {
      user = getState().users.user;
    }
    if (user) {
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
    } else {
      dispatch({
        type: ACTION.USERS.SET,
        user: null
      });
    }
    authenticatedRequest(dispatch,getState,'/api/user/'+userId,'GET',null,(user) => {
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
    });
  }
}

export const setActiveUserProp = (propname,propvalue) => {
  const action = {
    'type': ACTION.USERS.SET_USER_PROP,
    'updates': {}
  }
  action.updates[propname] = propvalue;
  return action;
}

export const updateUser = () => {
  return (dispatch,getState) => {
    const url = getState().users.user.id ? '/api/user/'+getState().users.user.id : '/api/user';
    const method = getState().users.user.id ? 'POST' : 'PUT';
    authenticatedRequest(dispatch,getState,url,method,getState().users.user,(user) => {
      if (getState().users.user.id === getState().user.user.id && getState().user.needsPasswordReset && getState().users.user.password) {
        dispatch({
          type: ACTION.USER.SET_NEEDS_PASSWORD_RESET,
          needsPasswordReset: false
        });
        dispatch({
          type: ACTION.MESSAGE.SET,
          message: null
        });
      } else {
        dispatch({
          type: ACTION.MESSAGE.SET,
          message: 'User saved.',
          messageType: 'info'
        });
      }
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
    });
  }
}

export const newUser = () => {
  return {
    type: ACTION.USERS.SET,
    user: {
      'email': '',
      'password': '',
      'role': 'user',
      'active': true,
      'ready': true
    }
  };
}

//TODO create a setActive
export const reassignUserReviews = (count,userId) => {
  return (dispatch,getState) => {
    let url = '/api/user/'+getState().users.user.id+'/reviews/reassign?n='+encodeURIComponent(count);
    if (userId) {
      url += '&user='+encodeURIComponent(userId);
    }
    authenticatedRequest(dispatch,getState,url,'POST',null,(result) => {
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: result.message,
        messageType: 'info'
      });
      dispatch(loadUsers());
    });
  }
}

export const setActiveUserNotificationPreference = (property,value) => {
  return {
    type: ACTION.USERS.SET_NOTIFICATION_PREFERENCE,
    property,
    value
  };
}
