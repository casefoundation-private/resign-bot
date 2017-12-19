import {
  ACTION
} from '../misc/constants'

export const clearMessage = () => {
  return {
    type: ACTION.MESSAGE.CLEAR
  }
}

export const setMessage = (message, messageType) => {
  return {
    type: ACTION.MESSAGE.SET,
    message,
    messageType
  }
}
