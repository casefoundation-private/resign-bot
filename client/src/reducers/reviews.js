import {
  ACTION
} from '../misc/constants';

const initialUserState = {
  review: null,
  reviews: null,
};

const reviews = (state = initialUserState, action) => {
  switch (action.type) {
    case ACTION.REVIEWS.SET:
      return Object.assign({},state,{
        'review': action.review || state.review,
        'reviews': action.reviews || state.reviews
      });
    case ACTION.REVIEWS.REMOVE:
      return Object.assign({},state,{
        'reviews': state.reviews.filter((review) => review.id !== action.review.id)
      });
    case ACTION.USER.LOGOUT:
      return initialUserState;
    default:
      return state;
  }
}

export default reviews;
