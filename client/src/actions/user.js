import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';

export const userLogin = (credentials) => {
  return (dispatch) => {
    dispatch({type:ACTION.USER.LOGIN});
    fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.token && responseData.id) {
        dispatch({type: ACTION.USER.LOGIN_SUCCESS, token: responseData.token, id: responseData.id});
        dispatch(loadUserDetails());
      } else if (responseData.error) {
        dispatch({type: ACTION.MESSAGE.SET, message: responseData.error, messageType: 'danger'})
      } else {
        dispatch({type: ACTION.MESSAGE.SET, message: 'Unknown error', messageType: 'danger'})
      }
    })
    .catch((error) => {
      dispatch({type: ACTION.MESSAGE.SET, message: error.message, messageType: 'danger'})
    })
  }
}

export const userLogout = () => ({type: ACTION.USER.LOGOUT});

export const loadUserDetails = () => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/user/' + getState().user.user.id,'GET',null,(user) => {
      dispatch({
        type: ACTION.USER.DETAILS,
        user
      });
    });
    authenticatedRequest(dispatch,getState,'/api/user/' + getState().user.user.id + '/favorites','GET',null,(favorites) => {
      dispatch({
        type: ACTION.USER.FAVORITES,
        favorites
      });
    });
    authenticatedRequest(dispatch,getState,'/api/config','GET',null,(config) => {
      dispatch({
        type: ACTION.CONFIG.SET,
        config
      });
    });
  }
}

export const resetPassword = (email) => {
  return (dispatch) => {
    fetch('/api/user/reset', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.message) {
        dispatch({type: ACTION.MESSAGE.SET, message: responseData.message, messageType: 'info'})
      } else if (responseData.error) {
        dispatch({type: ACTION.MESSAGE.SET, message: responseData.error, messageType: 'danger'})
      } else {
        dispatch({type: ACTION.MESSAGE.SET, message: 'Unknown error', messageType: 'danger'})
      }
    })
    .catch((error) => {
      dispatch({type: ACTION.MESSAGE.SET, message: error.message, messageType: 'danger'})
    })
  }
}

export const completePasswordReset = (resetCode) => {
  return (dispatch,getState) => {
    dispatch({type:ACTION.USER.LOGIN});
    fetch('/api/user/reset/'+resetCode, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.token && responseData.id) {
        dispatch({type: ACTION.USER.LOGIN_SUCCESS, token: responseData.token, id: responseData.id});
        dispatch(loadUserDetails());
        dispatch({
          type: ACTION.MESSAGE.SET,
          message: 'Your account has been unlocked. Please reset your password by going to My Account.',
          messageType: 'info'
        });
      } else if (responseData.error) {
        dispatch({type: ACTION.MESSAGE.SET, message: responseData.error, messageType: 'danger'})
      } else {
        dispatch({type: ACTION.MESSAGE.SET, message: 'Unknown error', messageType: 'danger'})
      }
    })
    .catch((error) => {
      dispatch({type: ACTION.MESSAGE.SET, message: error.message, messageType: 'danger'})
    })
  }
}

export const makeFavorite = (submission) => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/submission/' + submission.id + '/favorite','PUT',null,() => {
      dispatch({
        type: ACTION.USER.ADD_FAVORITE,
        submission: submission
      });
    });
  }
}

export const deleteFavorite = (submission) => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/submission/'+submission.id+'/favorite','DELETE',null,() => {
      dispatch({
        type: ACTION.USER.DELETE_FAVORITE,
        submission_id: submission.id
      });
    });
  }
}
