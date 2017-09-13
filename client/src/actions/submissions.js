import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';

export const loadSubmissions = () => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.SUBMISSIONS.SET,
      submissions: []
    });
    authenticatedRequest(dispatch,getState,'/api/submission','GET',null,(submissions) => {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submissions
      });
    });
  }
}

export const loadSubmission = (submissionId) => {
  return (dispatch,getState) => {
    const submission = getState().submissions.submissions && getState().submissions.submissions.find((submission) => {
      return submission.id === submissionId;
    });
    if (submission) {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission
      });
    } else {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission: []
      });
    }
    authenticatedRequest(dispatch,getState,'/api/submission/'+submissionId,'GET',null,(submission) => {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission
      });
    });
  }
}

export const toggleFlagSubmission = (submission) => {
  return (dispatch,getState) => {
    submission.flagged = !submission.flagged;
    authenticatedRequest(dispatch,getState,'/api/submission/' + submission.id,'POST',submission,(submission) => {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Submission flagged as inappropriate.',
        messageType: 'info'
      });
    });
  }
}

export const togglePinSubmission = (submission) => {
  return (dispatch,getState) => {
    submission.pinned = !submission.pinned;
    authenticatedRequest(dispatch,getState,'/api/submission/' + submission.id,'POST',submission,(submission) => {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Submission pinned to top.',
        messageType: 'info'
      });
      dispatch(loadSubmissions());
    });
  }
}
