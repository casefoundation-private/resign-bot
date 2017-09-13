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
      const list = action.submissions || state.submissions;
      if (action.submission && list) {
        const index = list.find((_submission) => _submission.id === action.submission.id);
        list[index] = action.submission;
      }
      return Object.assign({},state,{
        'submission': action.submission || state.submission,
        'submissions': list
      });
    case ACTION.USER.LOGOUT:
      return initialSubmissionsState;
    default:
      return state;
  }
}

export default submissions;
