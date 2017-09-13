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

export const loadUser = (userId) => {
  return (dispatch,getState) => {
    const user = getState().users.users && getState().users.users.find((user) => {
      return user.id === userId;
    });
    if (user) {
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
    } else {
      dispatch({
        type: ACTION.USERS.SET,
        user: []
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
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'User saved.',
        messageType: 'info'
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

export const reassignUserReviews = (user) => {
  return (dispatch,getState) => {
    const url = '/api/user/'+user.id+'/reassign';
    authenticatedRequest(dispatch,getState,url,'GET',null,(user) => {
      dispatch({
        type: ACTION.USERS.SET,
        user
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Reviews reassigned',
        messageType: 'info'
      });
      dispatch(loadUsers());
    });
  }
}
