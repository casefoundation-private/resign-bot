import {
  ACTION
} from '../constants';

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
    //TODO other action
    default:
      return state;
  }
}

export default reviews;
