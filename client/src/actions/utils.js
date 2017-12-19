/* global fetch */
import {
  ACTION
} from '../misc/constants'

export const authenticatedRequest = (dispatch, getState, action, method, payload, complete, errored) => {
  if (getState().user.token) {
    const params = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + getState().user.token
      }
    }
    if (payload) {
      params.body = JSON.stringify(payload)
    }
    fetch(action, params)
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.error) {
          dispatch({
            type: ACTION.MESSAGE.SET,
            message: responseData.error,
            messageType: 'danger'
          })
        } else {
          complete(responseData)
        }
      })
      .catch((error) => {
        dispatch({
          type: ACTION.MESSAGE.SET,
          message: error.message || error.error || error,
          messageType: 'danger'
        })
      })
  } else {
    dispatch({
      type: ACTION.MESSAGE.SET,
      message: 'Please log in to do that.',
      messageType: 'danger'
    })
  }
}
