import {
  ACTION
} from '../misc/constants';

export const clearMessage = () => {
  return {
    type: ACTION.MESSAGE.CLEAR
  }
}
