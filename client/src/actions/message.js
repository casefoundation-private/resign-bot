import {
  ACTION
} from '../constants';

export const clearMessage = () => {
  return {
    type: ACTION.MESSAGE.CLEAR
  }
}
