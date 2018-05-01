import {
  ACTION
} from '../misc/constants'
import {
  authenticatedRequest
} from './utils'

export const loadReviewsForSubmission = (submissionId) => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET,
      reviews: null
    })
    authenticatedRequest(dispatch, getState, '/api/submission/' + submissionId + '/reviews', 'GET', null, (reviews) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        reviews
      })
    })
  }
}

export const loadReviewsForUser = (userId) => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET,
      reviews: null
    })
    authenticatedRequest(dispatch, getState, '/api/user/' + userId + '/reviews', 'GET', null, (reviews) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        reviews
      })
    })
  }
}

export const setActiveReview = (review) => {
  return {
    type: ACTION.REVIEWS.SET,
    review
  }
}

export const loadReview = (reviewId) => {
  return (dispatch, getState) => {
    const review = getState().reviews.reviews && getState().reviews.reviews.find((review) => {
      return review.id === reviewId
    })
    if (review) {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      })
      dispatch(validateReview())
    } else {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review: null
      })
    }
    authenticatedRequest(dispatch, getState, '/api/review/' + reviewId, 'GET', null, (review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      })
      dispatch(validateReview())
    })
  }
}

export const updateReview = () => {
  return (dispatch, getState) => {
    const url = '/api/review/' + getState().reviews.review.id
    const method = 'POST'
    authenticatedRequest(dispatch, getState, url, method, getState().reviews.review, (review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      })
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review updated.',
        messageType: 'info'
      })
    })
  }
}

export const deleteReview = () => {
  return (dispatch, getState) => {
    const id = getState().reviews.review.id
    const url = '/api/review/' + id
    const method = 'DELETE'
    authenticatedRequest(dispatch, getState, url, method, getState().reviews.review, (status) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review: null,
        reviews: getState().reviews.reviews.filter((_review) => _review.id !== id)
      })
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: status.message,
        messageType: 'info'
      })
    })
  }
}

export const calculateAndUpdateReview = () => {
  return (dispatch, getState) => {
    if (getState().reviews.validation.isValid) {
      let score = 0
      if (!getState().reviews.review.flagged) {
        score = getState().reviews.review.data.prompts.reduce((total, v) => total + v, 0) / getState().reviews.review.data.prompts.length
      }
      dispatch({
        type: ACTION.REVIEWS.SET_SCORE,
        score
      })
      dispatch(updateReview())
    } else {
      dispatch(generateReviewValidationFeedback())
    }
  }
}

export const recuseReview = (review) => {
  return (dispatch, getState) => {
    const url = '/api/review/' + review.id + '/recuse'
    const method = 'POST'
    authenticatedRequest(dispatch, getState, url, method, null, () => {
      dispatch({
        type: ACTION.REVIEWS.REMOVE,
        review
      })
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review recused.',
        messageType: 'info'
      })
    })
  }
}

export const setReviewPromptValue = (prompt, value) => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET_PROMPT_VALUE,
      prompt,
      value
    })
    dispatch(validateReview())
  }
}

export const setReviewCategoryValue = (category, value) => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET_CATEGORY_VALUE,
      category,
      value
    })
    dispatch(validateReview())
  }
}

export const setReviewFlagged = (flagged) => {
  return (dispatch, getState) => {
    dispatch({
      type: ACTION.REVIEWS.SET_FLAGGED,
      flagged
    })
    dispatch(validateReview())
  }
}

export const newReviewForSubmission = (submissionId) => {
  return (dispatch, getState) => {
    const url = '/api/review'
    const method = 'PUT'
    const review = {
      'submission_id': submissionId
    }
    dispatch({
      type: ACTION.REVIEWS.SET,
      review
    })
    authenticatedRequest(dispatch, getState, url, method, review, (review) => {
      dispatch({
        type: ACTION.REVIEWS.SET,
        review
      })
      dispatch(loadReviewsForSubmission(review.submission_id))
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Review created.',
        messageType: 'info'
      })
    })
  }
}

export const validateReview = () => {
  return (dispatch, getState) => {
    if (getState().reviews.review.score === null) {
      if (getState().reviews.review.flagged) {
        dispatch({
          type: ACTION.REVIEWS.VALIDATE
        })
      } else {
        const invalidPrompts = []
        for (var i = 0; i < getState().config.config.review.prompts.length; i++) {
          if (typeof getState().reviews.review.data.prompts[i] !== 'number') {
            dispatch({
              type: ACTION.REVIEWS.SET_PROMPT_VALUE,
              prompt: i,
              value: null
            })
            invalidPrompts.push(i)
          } else if (getState().reviews.review.data.prompts[i] === null) {
            invalidPrompts.push(i)
          }
        }
        const invalidCategories = []
        for (i = 0; i < getState().config.config.review.categories.length; i++) {
          if (typeof getState().reviews.review.data.categories[i] !== 'string') {
            dispatch({
              type: ACTION.REVIEWS.SET_CATEGORY_VALUE,
              category: i,
              value: null
            })
            invalidCategories.push(i)
          } else if (getState().reviews.review.data.categories[i] === null) {
            invalidCategories.push(i)
          }
        }
        if (invalidPrompts.length === 0 && invalidCategories.length === 0) {
          dispatch({
            type: ACTION.REVIEWS.VALIDATE
          })
        } else {
          dispatch({
            type: ACTION.REVIEWS.INVALIDATE,
            invalidPrompts,
            invalidCategories
          })
        }
      }
    } else {
      dispatch({
        type: ACTION.REVIEWS.INVALIDATE,
        invalidPrompts: null,
        invalidCategories: null
      })
    }
  }
}

export const generateReviewValidationFeedback = () => {
  return (dispatch, getState) => {
    if (getState().reviews.review.score === null) {
      for (var i = 0; i < getState().config.config.review.prompts.length; i++) {
        if (getState().reviews.review.data.prompts[i] === null) {
          dispatch({
            type: ACTION.MESSAGE.SET,
            message: 'Please complete all review prompts.',
            messageType: 'danger'
          })
          return
        }
      }
    }
  }
}
