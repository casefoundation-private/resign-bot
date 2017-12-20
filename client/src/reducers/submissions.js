import {
  ACTION
} from '../misc/constants'

const initialSubmissionsState = {
  submission: null,
  submissions: null,
  sort: {
    field: 'pinned',
    direction: 'desc'
  },
  search: {
    str: null,
    indices: null
  }
}

const submissions = (state = initialSubmissionsState, action) => {
  switch (action.type) {
    case ACTION.SUBMISSIONS.SET:
      const list = (action.submissions || state.submissions) ? (action.submissions || state.submissions).slice(0) : null
      if (action.submission && list) {
        const index = list.findIndex((_submission) => _submission.id === action.submission.id)
        if (index >= 0) {
          list[index] = action.submission
        }
      }
      if (list) {
        list.forEach((submission) => {
          submission.created_at = new Date(submission.created_at)
        })
      }
      if (action.submission && typeof action.submission.created_at === 'string') {
        action.submission.created_at = new Date(action.submission.created_at)
      }
      return Object.assign({}, state, {
        'submission': action.submission || state.submission,
        'submissions': list
      })
    case ACTION.SUBMISSIONS.SET_SORT:
      return Object.assign({}, state, {
        'sort': Object.assign({}, state.sort, {
          field: action.field,
          direction: action.direction
        })
      })
    case ACTION.SUBMISSIONS.SET_SEARCH:
      return Object.assign({}, state, {
        'search': Object.assign({}, state.sort, {
          str: action.str,
          indices: action.indices
        })
      })
    case ACTION.SUBMISSIONS.TOGGLE_FLAGGED:
      const updated = syncPropToObjectAndList(state.submissions, state.submission, {
        flagged: !state.submission.flagged
      })
      return Object.assign({}, state, {
        submission: updated.object,
        submissions: updated.list
      })
    case ACTION.SUBMISSIONS.TOGGLE_PINNED:
      const updated1 = syncPropToObjectAndList(state.submissions, state.submission, {
        pinned: !state.submission.pinned
      })
      return Object.assign({}, state, {
        submission: updated1.object,
        submissions: updated1.list
      })
    case ACTION.SUBMISSIONS.CLEAR_AUTO_FLAGGED:
      const updated2 = syncPropToObjectAndList(state.submissions, state.submission, {
        autoFlagged: false
      })
      return Object.assign({}, state, {
        submission: updated2.object,
        submissions: updated2.list
      })
    case ACTION.USER.LOGOUT:
      return initialSubmissionsState
    default:
      return state
  }
}

const syncPropToObjectAndList = (list, object, propSet) => {
  const newObject = Object.assign({}, object, propSet)
  const newList = list.slice(0)
  const indexInList = newList.findIndex((_object) => _object.id === newObject.id)
  if (indexInList >= 0) {
    newList[indexInList] = newObject
  }
  return {
    list: newList,
    object: newObject
  }
}

export default submissions
