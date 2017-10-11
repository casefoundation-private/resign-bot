import {
  ACTION
} from '../misc/constants';

const initialImporterState = {
  embargoed: null
};

const importer = (state = initialImporterState, action) => {
  switch (action.type) {
    case ACTION.IMPORTER.SET_EMBARGOED:
      return Object.assign({},state,{
        'embargoed': action.embargoed
      });
    case ACTION.USER.LOGOUT:
      return Object.assign({},initialImporterState);
    default:
      return state;
  }
}

export default importer;
