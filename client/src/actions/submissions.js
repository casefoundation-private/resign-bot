import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';
import {
  summarizeSubmission,
  getFavorite,
  completedReviews,
  incompletedReviews,
  actualFlagsForSubmission
} from '../misc/utils';

export const sortSubmissions = () => {
  return (dispatch,getState) => {
    const submissions = getState().submissions.submissions.slice(0);
    submissions.sort((a,b) => {
      let aVal = null;
      let bVal = null;
      switch(getState().submissions.sort.field) {
        case 'id':
        case 'score':
        case 'deviation':
          aVal = a[getState().submissions.sort.field] === null ? -1 : a[getState().submissions.sort.field];
          bVal = b[getState().submissions.sort.field] === null ? -1 : b[getState().submissions.sort.field];
          break;
        case 'flags':
          aVal = actualFlagsForSubmission(getState().config,a) === 'N/A' ? -1 : actualFlagsForSubmission(getState().config,a);
          bVal = actualFlagsForSubmission(getState().config,b) === 'N/A' ? -1 : actualFlagsForSubmission(getState().config,b);
          break;
        case 'pinned':
          aVal = a[getState().submissions.sort.field] ? 1 : 0;
          bVal = b[getState().submissions.sort.field] ? 1 : 0;
          break;
        case 'flagged':
          if (getState().config.flaggedByDefault) {
            aVal = a[getState().submissions.sort.field] ? 0 : 1;
            bVal = b[getState().submissions.sort.field] ? 0 : 1;
          } else {
            aVal = a[getState().submissions.sort.field] ? 1 : 0;
            bVal = b[getState().submissions.sort.field] ? 1 : 0;
          }
          break;
        case 'autoFlagged':
        case 'embargoed':
          aVal = a[getState().submissions.sort.field] ? 1 : 0;
          bVal = b[getState().submissions.sort.field] ? 1 : 0;
          break;
        case 'created_at':
          aVal = a.created_at.getTime();
          bVal = b.created_at.getTime();
          break;
        case 'summary':
          aVal = summarizeSubmission(a);
          bVal = summarizeSubmission(b);
          if (getState().submissions.sort.direction === 'asc') {
            return aVal.localeCompare(bVal);
          } else {
            return bVal.localeCompare(aVal);
          }
        case 'completedReviews':
          aVal = completedReviews(a).length;
          bVal = completedReviews(b).length;
          break;
        case 'assignedReviews':
          aVal = incompletedReviews(a).length;
          bVal = incompletedReviews(b).length;
          break;
        case 'favorite':
          aVal = getFavorite(getState().user.favorites,a) ? 1 : 0;
          bVal = getFavorite(getState().user.favorites,b) ? 1 : 0;
          break;
        default:
          if (getState().submissions.sort.field.indexOf('category_') === 0) {
            const categoryIndex = parseInt(getState().submissions.sort.field.replace('category_',''));
            const categoryName = getState().config.review.categories[categoryIndex].prompt;
            aVal = a.categories[categoryName] || null;
            bVal = b.categories[categoryName] || null;
            if (aVal && bVal) {
              if (getState().submissions.sort.direction === 'asc') {
                return aVal.localeCompare(bVal);
              } else {
                return bVal.localeCompare(aVal);
              }
            }
          } else {
            aVal = 0;
            bVal = 0;
          }
          break;
      }
      if (aVal === bVal) {
        aVal = a.created_at.getTime();
        bVal = b.created_at.getTime();
      }
      if (getState().submissions.sort.direction === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    dispatch({
      type: ACTION.SUBMISSIONS.SET,
      submissions
    });
  }
}

export const setSubmissionSort = (field,direction) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.SUBMISSIONS.SET_SORT,
      field,
      direction
    });
    dispatch(sortSubmissions());
  }
}

export const setSubmissionSearch = (str) => {
  return (dispatch,getState) => {
    if (str) {
      const indices = [];
      getState().submissions.submissions.forEach((submission,i) => {
        const summary = summarizeSubmission(submission);
        if (summary.toLowerCase().indexOf(str.toLowerCase()) >= 0) {
          indices.push(i);
        }
      });
      dispatch({
        type: ACTION.SUBMISSIONS.SET_SEARCH,
        str: str,
        indices: indices
      });
    } else {
      dispatch({
        type: ACTION.SUBMISSIONS.SET_SEARCH,
        str: null,
        indices: null
      });
    }
  }
}

export const loadSubmissions = () => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.SUBMISSIONS.SET,
      submissions: []
    });
    const url = '/api/submission';
    authenticatedRequest(dispatch,getState,url,'GET',null,(submissions) => {
      submissions.forEach((submission) => {
        submission.created_at = new Date(submission.created_at)
      })
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submissions
      });
      dispatch(sortSubmissions());
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

//TODO this really isn't the right way to do this
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
        message: submission.flagged ? 'Submission flagged as inappropriate.' : 'Submission unflagged as inappropriate.',
        messageType: 'info'
      });
      dispatch(sortSubmissions());
    });
  }
}

//TODO this really isn't the right way to do this
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
        message: submission.pinned ? 'Submission pinned to top.' : 'Submission unpinned.',
        messageType: 'info'
      });
      dispatch(sortSubmissions());
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

//TODO this really isn't the right way to do this
export const clearAutoFlagSubmission = (submission) => {
  return (dispatch,getState) => {
    submission.autoFlagged = false;
    authenticatedRequest(dispatch,getState,'/api/submission/' + submission.id,'POST',submission,(submission) => {
      dispatch({
        type: ACTION.SUBMISSIONS.SET,
        submission
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Submission auto-flag cleared.',
        messageType: 'info'
      });
      dispatch(sortSubmissions());
    });
  }
}
