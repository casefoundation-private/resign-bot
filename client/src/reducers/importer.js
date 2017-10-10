import {
  ACTION
} from '../misc/constants';

const initialImporterState = {
  paused: null
};

const importer = (state = initialImporterState, action) => {
  switch (action.type) {
    case ACTION.IMPORTER.SET_PAUSED:
      return Object.assign({},state,{
        'paused': action.paused
      });
    case ACTION.USER.LOGOUT:
      return Object.assign({},initialImporterState);
    default:
      return state;
  }
}

export default importer;
