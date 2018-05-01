import {
  ACTION
} from '../misc/constants'
import {
  authenticatedRequest
} from './utils'

export const loadConfig = () => {
  return (dispatch, getState) => {
    authenticatedRequest(dispatch, getState, '/api/config', 'GET', null, (config) => {
      dispatch({
        type: ACTION.CONFIG.SET,
        config
      })
    })
  }
}

export const commitTempConfig = () => {
  return (dispatch, getState) => {
    authenticatedRequest(dispatch, getState, '/api/config', 'POST', getState().config.tempConfig, (config) => {
      dispatch({
        type: ACTION.CONFIG.SET,
        config
      })
      dispatch({
        type: ACTION.MESSAGE.SET,
        message: 'Configuration saved.',
        messageType: 'info'
      })
    })
  }
}

export const setTempConfig = (config) => {
  return {
    type: ACTION.CONFIG.SET_TEMP,
    config
  }
}

export const addNewTempConfigPrompt = () => {
  return {
    type: ACTION.CONFIG.ADD_TEMP_CONFIG_PROMPT
  }
}

export const addNewTempConfigPromptLabel = (index) => {
  return {
    type: ACTION.CONFIG.ADD_TEMP_CONFIG_PROMPT_LABEL,
    index
  }
}

export const removeTempConfigPrompt = (index) => {
  return {
    type: ACTION.CONFIG.REMOVE_TEMP_CONFIG_PROMPT,
    index
  }
}

export const removeTempConfigPromptLabel = (promptIndex, labelIndex) => {
  return {
    type: ACTION.CONFIG.REMOVE_TEMP_CONFIG_PROMPT_LABEL,
    promptIndex,
    labelIndex
  }
}

export const setTempConfigPromptText = (index, text) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_PROMPT_TEXT,
    index,
    text
  }
}

export const setTempConfigPromptLabelText = (promptIndex, labelIndex, text) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_PROMPT_LABEL_TEXT,
    promptIndex,
    labelIndex,
    text
  }
}

export const addNewTempConfigCategory = () => {
  return {
    type: ACTION.CONFIG.ADD_TEMP_CONFIG_CATEGORY
  }
}

export const addNewTempConfigCategoryLabel = (index) => {
  return {
    type: ACTION.CONFIG.ADD_TEMP_CONFIG_CATEGORY_LABEL,
    index
  }
}

export const removeTempConfigCategory = (index) => {
  return {
    type: ACTION.CONFIG.REMOVE_TEMP_CONFIG_CATEGORY,
    index
  }
}

export const removeTempConfigCategoryLabel = (promptIndex, labelIndex) => {
  return {
    type: ACTION.CONFIG.REMOVE_TEMP_CONFIG_CATEGORY_LABEL,
    promptIndex,
    labelIndex
  }
}

export const setTempConfigCategoryText = (index, text) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_CATEGORY_TEXT,
    index,
    text
  }
}

export const setTempConfigCategoryLabelText = (promptIndex, labelIndex, text) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_CATEGORY_LABEL_TEXT,
    promptIndex,
    labelIndex,
    text
  }
}

export const setTempConfigImportPauseStart = (index, value) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_IMPORT_PAUSE_START,
    index,
    value
  }
}

export const setTempConfigImportPauseLength = (index, value) => {
  return {
    type: ACTION.CONFIG.SET_TEMP_CONFIG_IMPORT_PAUSE_LENGTH,
    index,
    value
  }
}

export const removeTempConfigImportPause = (index) => {
  return {
    type: ACTION.CONFIG.REMOVE_TEMP_CONFIG_IMPORT_PAUSE,
    index
  }
}

export const addNewTempConfigImportPause = () => {
  return {
    type: ACTION.CONFIG.ADD_NEW_TEMP_CONFIG_IMPORT_PAUSE
  }
}
