import {
  ACTION
} from '../misc/constants';

const initialSubmissionsState = {
  submission: null,
  submissions: null,
};

const submissions = (state = initialSubmissionsState, action) => {
  switch (action.type) {
    case ACTION.SUBMISSIONS.SET:
      return Object.assign({},state,{
        'submission': action.submission || state.submission,
        'submissions': action.submissions || state.submissions
      });
    case ACTION.USER.LOGOUT:
      return initialSubmissionsState;
    default:
      return state;
  }
}

export default submissions;
