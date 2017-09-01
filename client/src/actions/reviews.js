import {
  ACTION
} from '../constants';
import {
  authenticatedRequest
} from './utils';

export const loadReviews = (submissionId) => {
  return (dispatch,getState) => {
    authenticatedRequest(dispatch,getState,'/api/submission/'+submissionId+'/reviews','GET',null,(reviews) => {
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
    const review = getState().reviews.reviews && getState().reviews.reviews.find((reviews) => {
      return review.id === reviewId;
    });
    if (review) {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      });
    } else {
      authenticatedRequest(dispatch,getState,'/api/review/'+reviewId,'GET',null,(review) => {
        dispatch({
          type: ACTION.REVIEWS.SET,
          review
        });
      });
    }
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
