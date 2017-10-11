import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';
import {
  loadSubmissions
} from './submissions'

export const loadImporterEmbargoedState = () => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/importer/embargoed','GET',null,(status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_EMBARGOED,
        embargoed: status.embargoed
      });
    });
  }
}


export const setImporterEmbargoed = (embargoed) => {
  return (dispatch,getState) => {
    const payload = {
      embargoed
    };
    authenticatedRequest(dispatch,getState,'/api/importer/embargoed','POST',payload,(status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_EMBARGOED,
        embargoed: status.embargoed
      });
      dispatch(loadSubmissions());
    });
  }
}
