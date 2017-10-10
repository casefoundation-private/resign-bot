import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';

export const loadImporterPausedState = () => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/importer/paused','GET',null,(status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_PAUSED,
        paused: status.paused
      });
    });
  }
}


export const setImporterPaused = (paused) => {
  return (dispatch,getState) => {
    const payload = {
      paused
    };
    authenticatedRequest(dispatch,getState,'/api/importer/paused','POST',payload,(status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_PAUSED,
        paused: status.paused
      });
    });
  }
}
