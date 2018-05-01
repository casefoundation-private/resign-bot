import {
  ACTION
} from '../misc/constants'

const initialConfigState = {
  config: {
    'prompts': []
  },
  tempConfig: {}
}

const duplicateTempConfigReviewField = (state, type) => {
  return (state.tempConfig.review[type] || []).map(x => Object.assign({}, x))
}

const duplicateTempConfigImportPauses = (state) => {
  return (state.tempConfig.importPauses || []).map(x => Object.assign({}, x))
}

const config = (state = initialConfigState, action) => {
  switch (action.type) {
    case ACTION.CONFIG.SET:
      return Object.assign({}, state, {
        config: action.config,
        tempConfig: action.config
      })
    case ACTION.CONFIG.SET_TEMP:
      return Object.assign({}, state, {
        tempConfig: Object.assign({}, state.tempConfig, action.config)
      })
    case ACTION.CONFIG.ADD_TEMP_CONFIG_PROMPT:
      return addTempConfigReviewField('prompts', state, action)
    case ACTION.CONFIG.ADD_TEMP_CONFIG_PROMPT_LABEL:
      return addTempConfigReviewFieldLabel('prompts', state, action)
    case ACTION.CONFIG.REMOVE_TEMP_CONFIG_PROMPT:
      return removeTempConfigReviewField('prompts', state, action)
    case ACTION.CONFIG.REMOVE_TEMP_CONFIG_PROMPT_LABEL:
      return removeTempConfigReviewFieldLabel('prompts', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_PROMPT_TEXT:
      return setTempConfigReviewFieldText('prompts', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_PROMPT_LABEL_TEXT:
      return setTempConfigReviewFieldLabelText('prompts', state, action)
    case ACTION.CONFIG.ADD_TEMP_CONFIG_CATEGORY:
      return addTempConfigReviewField('categories', state, action)
    case ACTION.CONFIG.ADD_TEMP_CONFIG_CATEGORY_LABEL:
      return addTempConfigReviewFieldLabel('categories', state, action)
    case ACTION.CONFIG.REMOVE_TEMP_CONFIG_CATEGORY:
      return removeTempConfigReviewField('categories', state, action)
    case ACTION.CONFIG.REMOVE_TEMP_CONFIG_CATEGORY_LABEL:
      return removeTempConfigReviewFieldLabel('categories', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_CATEGORY_TEXT:
      return setTempConfigReviewFieldText('categories', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_CATEGORY_LABEL_TEXT:
      return setTempConfigReviewFieldLabelText('categories', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_IMPORT_PAUSE_START:
      return setTempConfigImportPauseProp('start', state, action)
    case ACTION.CONFIG.SET_TEMP_CONFIG_IMPORT_PAUSE_LENGTH:
      return setTempConfigImportPauseProp('length', state, action)
    case ACTION.CONFIG.REMOVE_TEMP_CONFIG_IMPORT_PAUSE:
      return removeTempConfigImportPause(state, action)
    case ACTION.CONFIG.ADD_NEW_TEMP_CONFIG_IMPORT_PAUSE:
      return addNewTempConfigImportPause(state, action)
    case ACTION.USER.LOGOUT:
      return initialConfigState
    default:
      return state
  }
}

const setTempConfigImportPauseProp = (prop, state, action) => {
  const importPauses = duplicateTempConfigImportPauses(state)
  if (action.index < importPauses.length) {
    importPauses[action.index][prop] = action.value
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        importPauses
      })
    })
  }
  return state
}

const removeTempConfigImportPause = (state, action) => {
  const importPauses = duplicateTempConfigImportPauses(state)
  if (action.index < importPauses.length) {
    importPauses.splice(action.index, 1)
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        importPauses
      })
    })
  }
  return state
}

const addNewTempConfigImportPause = (state, action) => {
  const importPauses = duplicateTempConfigImportPauses(state)
  importPauses.push({
    'start': null,
    'length': null
  })
  return Object.assign({}, state, {
    tempConfig: Object.assign({}, state.tempConfig, {
      importPauses
    })
  })
}

const addTempConfigReviewField = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  array.push({
    prompt: null,
    labels: [null]
  })
  const update = {}
  update[type] = array
  return Object.assign({}, state, {
    tempConfig: Object.assign({}, state.tempConfig, {
      review: Object.assign({}, state.tempConfig.review, update)
    })
  })
}

const addTempConfigReviewFieldLabel = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  if (action.index < array.length) {
    array[action.index].labels.push(null)
    const update = {}
    update[type] = array
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        review: Object.assign({}, state.tempConfig.review, update)
      })
    })
  }
  return state
}

const removeTempConfigReviewField = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  if (action.index < array.length) {
    array.splice(action.index, 1)
    const update = {}
    update[type] = array
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        review: Object.assign({}, state.tempConfig.review, update)
      })
    })
  }
  return state
}

const removeTempConfigReviewFieldLabel = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  if (action.promptIndex < array.length && action.labelIndex < array[action.promptIndex].labels.length) {
    array[action.promptIndex].labels.splice(action.labelIndex, 1)
    const update = {}
    update[type] = array
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        review: Object.assign({}, state.tempConfig.review, update)
      })
    })
  }
  return state
}

const setTempConfigReviewFieldText = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  if (action.index < array.length) {
    array[action.index].prompt = action.text
    const update = {}
    update[type] = array
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        review: Object.assign({}, state.tempConfig.review, update)
      })
    })
  }
  return state
}

const setTempConfigReviewFieldLabelText = (type, state, action) => {
  const array = duplicateTempConfigReviewField(state, type)
  if (action.promptIndex < array.length && action.labelIndex < array[action.promptIndex].labels.length) {
    array[action.promptIndex].labels[action.labelIndex] = action.text
    const update = {}
    update[type] = array
    return Object.assign({}, state, {
      tempConfig: Object.assign({}, state.tempConfig, {
        review: Object.assign({}, state.tempConfig.review, update)
      })
    })
  }
  return state
}

export default config
