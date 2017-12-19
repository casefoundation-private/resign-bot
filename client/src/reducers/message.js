import {
  ACTION
} from '../misc/constants'

const initialMessageState = {
  message: null,
  messageType: null
}

const message = (state = initialMessageState, action) => {
  switch (action.type) {
    case ACTION.MESSAGE.SET:
      return Object.assign({}, state, {
        'message': action.message,
        'messageType': action.messageType || 'default'
      })
    case ACTION.MESSAGE.CLEAR:
    case ACTION.USER.LOGOUT:
      return Object.assign({}, initialMessageState)
    default:
      return state
  }
}

export default message
