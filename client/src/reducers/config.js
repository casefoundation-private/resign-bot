import {
  ACTION
} from '../misc/constants';

const initialConfigState = {
  'prompts': []
};

const config = (state = initialConfigState, action) => {
  switch (action.type) {
    case ACTION.CONFIG.SET:
      return Object.assign({},state,action.config);
    case ACTION.USER.LOGOUT:
      return initialConfigState;
    default:
      return state;
  }
}

export default config;
