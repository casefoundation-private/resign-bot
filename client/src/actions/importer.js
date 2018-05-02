/* global FormData fetch */
import {
  ACTION
} from '../misc/constants'
import {
  authenticatedRequest
} from './utils'
import {
  loadSubmissions
} from './submissions'
import {
  setMessage
} from './message'

export const loadImporterEmbargoedState = () => {
  return (dispatch, getState) => {
    authenticatedRequest(dispatch, getState, '/api/import/embargoed', 'GET', null, (status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_EMBARGOED,
        embargoed: status.embargoed
      })
    })
  }
}

export const setImporterEmbargoed = (embargoed) => {
  return (dispatch, getState) => {
    const payload = {
      embargoed
    }
    authenticatedRequest(dispatch, getState, '/api/import/embargoed', 'POST', payload, (status) => {
      dispatch({
        type: ACTION.IMPORTER.SET_EMBARGOED,
        embargoed: status.embargoed
      })
      dispatch(loadSubmissions())
    })
  }
}

export const loadImports = () => {
  return (dispatch, getState) => {
    authenticatedRequest(dispatch, getState, '/api/import', 'GET', null, (imports) => {
      dispatch({
        type: ACTION.IMPORTER.SET_IMPORTS,
        imports
      })
    })
  }
}

export const importFiles = (files) => {
  const uploadable = files.filter((file) => ['application/json', 'text/csv'].indexOf(file.type) >= 0)
  if (uploadable.length === 0) {
    return setMessage('Please upload either a CSV or JSON file.', 'danger')
  }
  return (dispatch, getState) => {
    Promise.all(uploadable.map(file => {
      const data = new FormData()
      data.append('file', file)
      const params = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'JWT ' + getState().user.token
        },
        body: data
      }
      return fetch('/api/import', params)
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.error) {
            throw new Error(responseData.error)
          }
        })
    }))
      .then(() => {
        dispatch(setMessage('Files successfully imported!.', 'success'))
        dispatch(loadImports())
      })
      .catch((error) => {
        dispatch({
          type: ACTION.MESSAGE.SET,
          message: error.message || error.error || error,
          messageType: 'danger'
        })
      })
  }
}
