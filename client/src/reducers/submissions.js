import {
  ACTION
} from '../constants';

const initialUserState = {
  submission: null,
  submissions: null,
};

const submissions = (state = initialUserState, action) => {
  switch (action.type) {
    case ACTION.SUBMISSIONS.SET:
      return Object.assign({},state,{
        'submission': action.submission || state.submission,
        'submissions': action.submissions || state.submissions
      });
    default:
      return state;
  }
}

export default submissions;
