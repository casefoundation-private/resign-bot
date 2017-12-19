import {
  ACTION
} from '../misc/constants'

const initialReviewsState = {
  review: null,
  validation: {
    isValid: false,
    invalidPrompts: [],
    invalidCategories: []
  },
  reviews: null
}

const reviews = (state = initialReviewsState, action) => {
  switch (action.type) {
    case ACTION.REVIEWS.SET:
      const review = Object.assign({}, (action.review || state.review))
      if (review && !review.data) {
        review.data = {}
      }
      if (review && !review.data.prompts) {
        review.data.prompts = []
      }
      if (review && !review.data.categories) {
        review.data.categories = []
      }
      return Object.assign({}, state, {
        'review': review,
        'reviews': action.reviews || state.reviews
      })
    case ACTION.REVIEWS.REMOVE:
      return Object.assign({}, state, {
        'reviews': state.reviews.filter((review) => review.id !== action.review.id)
      })
    case ACTION.REVIEWS.SET_PROMPT_VALUE:
      const clonedPrompts = state.review.data.prompts ? state.review.data.prompts.slice(0) : []
      clonedPrompts[action.prompt] = action.value
      return Object.assign({}, state, {
        'review': Object.assign({}, state.review, {
          'data': Object.assign({}, state.review.data, {
            'prompts': clonedPrompts
          })
        })
      })
    case ACTION.REVIEWS.SET_CATEGORY_VALUE:
      const clonedCategories = state.review.data.categories ? state.review.data.categories.slice(0) : []
      clonedCategories[action.category] = action.value
      return Object.assign({}, state, {
        'review': Object.assign({}, state.review, {
          'data': Object.assign({}, state.review.data, {
            'categories': clonedCategories
          })
        })
      })
    case ACTION.REVIEWS.SET_SCORE:
      return Object.assign({}, state, {
        'review': Object.assign({}, state.review, {
          score: action.score
        })
      })
    case ACTION.REVIEWS.SET_FLAGGED:
      return Object.assign({}, state, {
        'review': Object.assign({}, state.review, {
          'flagged': action.flagged
        })
      })
    case ACTION.REVIEWS.VALIDATE:
      return Object.assign({}, state, {
        'validation': {
          isValid: true,
          invalidPrompts: [],
          invalidCategories: []
        }
      })
    case ACTION.REVIEWS.INVALIDATE:
      return Object.assign({}, state, {
        'validation': {
          isValid: false,
          invalidPrompts: action.invalidPrompts,
          invalidCategories: action.invalidCategories
        }
      })
    case ACTION.USER.LOGOUT:
      return initialReviewsState
    default:
      return state
  }
}

export default reviews
