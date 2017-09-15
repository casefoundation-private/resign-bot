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

export const downloadSubmissions = () => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/submission/export','GET',null,(data) => {
      const blob = new Blob([data.csv], {type: 'text/csv'});
      const a = document.createElement("a");
      a.style = "display: none";
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'Review-O-Matic Submissions Export ' + (new Date().toLocaleString()) + '.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
