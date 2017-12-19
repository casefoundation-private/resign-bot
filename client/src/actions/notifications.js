import {
  ACTION
} from '../misc/constants'
import {
  authenticatedRequest
} from './utils'

export const loadNotifications = () => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.NOTIFICATIONS.SET,
      notifications: null
    })
    authenticatedRequest(dispatch, getState, '/api/notification', 'GET', null, (notifications) => {
      dispatch({
        type: ACTION.NOTIFICATIONS.SET,
        notifications
      })
    })
  }
}
