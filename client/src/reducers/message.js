import {
  ACTION
} from '../constants';

const initialMessageState = {
  message: null,
  messageType: null
};

const message = (state = initialMessageState, action) => {
  switch (action.type) {
    case ACTION.MESSAGE.SET:
      return Object.assign({},state,{
        'message': action.message,
        'messageType': action.messageType || 'default'
      });
    case ACTION.MESSAGE.CLEAR:
      return Object.assign({},initialMessageState);
    default:
      return state;
  }
}

export default message;
