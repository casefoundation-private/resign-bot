import {
  ACTION
} from '../misc/constants'

const initialNotificationsState = {
  'notifications': []
}

const config = (state = initialNotificationsState, action) => {
  switch (action.type) {
    case ACTION.NOTIFICATIONS.SET:
      return Object.assign({}, state, {
        'notifications': action.notifications
      })
    default:
      return state
  }
}

export default config
