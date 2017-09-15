import {
  ACTION
} from '../misc/constants';
import {
  authenticatedRequest
} from './utils';

export const loadReviewsForSubmission = (submissionId) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET,
      reviews: []
    });
    authenticatedRequest(dispatch,getState,'/api/submission/'+submissionId+'/reviews','GET',null,(reviews) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        reviews
      });
    });
  }
}

export const loadReviewsForUser = (userId) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET,
      reviews: []
    });
    authenticatedRequest(dispatch,getState,'/api/user/'+userId+'/reviews','GET',null,(reviews) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        reviews
      });
    });
  }
}

export const setActiveReview = (review) => {
  return {
    type: ACTION.REVIEWS.SET,
    review
  }
}

export const loadReview = (reviewId) => {
  return (dispatch,getState) => {
    const review = getState().reviews.reviews && getState().reviews.reviews.find((review) => {
      return review.id === reviewId;
    });
    if (review) {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      });
    } else {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review: null
      });
    }
    authenticatedRequest(dispatch,getState,'/api/review/'+reviewId,'GET',null,(review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      });
    });
  }
}

export const updateReview = () => {
  return (dispatch,getState) => {
    const url = '/api/review/' + getState().reviews.review.id;
    const method = 'POST'
    authenticatedRequest(dispatch,getState,url,method,getState().reviews.review,(review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review updated.',
        messageType: 'info'
      });
    });
  }
}

export const calculateAndUpdateReview = () => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.REVIEWS.CALCULATE,
    });
    dispatch(updateReview());
  }
}

export const recuseReview = (review) => {
  return (dispatch,getState) => {
    const url = '/api/review/' + review.id + '/recuse';
    const method = 'POST'
    authenticatedRequest(dispatch,getState,url,method,null,() => {
      dispatch({
        type: ACTION.REVIEWS.REMOVE,
        review
      });
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review recused.',
        messageType: 'info'
      });
    });
  }
}

export const setReviewPromptValue = (prompt,value) => {
  return {
    type: ACTION.REVIEWS.SET_PROMPT_VALUE,
    prompt,
    value
  };
}

export const setReviewFlagged = (flagged) => {
  return {
    type: ACTION.REVIEWS.SET_FLAGGED,
    flagged
  };
}

export const newReviewForSubmission = (submissionId) => {
  return (dispatch,getState) => {
    const url = '/api/review';
    const method = 'PUT'
    const review = {
      'submission_id': submissionId
    }
    dispatch({
      type: ACTION.REVIEWS.SET,
      review
    });
    authenticatedRequest(dispatch,getState,url,method,review,(review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      });
      dispatch(loadReviewsForSubmission(review.submission_id));
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review created.',
        messageType: 'info'
      });
    });
  }
}
