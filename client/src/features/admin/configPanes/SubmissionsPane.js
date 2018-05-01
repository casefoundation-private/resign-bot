import React from 'react'
import PropTypes from 'prop-types'
import {ConfigurationField} from '../../../misc/utils'

const SubmissionsPane = (props) => {
  return (
    <div>
      <ConfigurationField
        label={'Allow public read access to submissions'}
        name={'submissionPublicReadAccess'}
        type={'checkbox'}
        tempConfig={props.tempConfig}
        setTempConfig={props.setTempConfig}
        help={(<span>Allow public access to GET to <em>/api/submission/public</em>.</span>)}
      />
      <ConfigurationField
        label={'Allow public write access to submissions'}
        name={'submissionPublicWriteAccess'}
        type={'checkbox'}
        tempConfig={props.tempConfig}
        setTempConfig={props.setTempConfig}
        help={(<span>Allow public access to PUT to <em>/api/submission/public</em>.</span>)}
      />
      <ConfigurationField
        label={'Cross-origin-request allowed domains (One per line)'}
        name={'allowedPublicSubmissionOrigins'}
        type={'textarea'}
        transformIn={(val) => val.join('\n')}
        transformOut={(val) => val.split('\n')}
        tempConfig={props.tempConfig}
        setTempConfig={props.setTempConfig}
        help={(<span>Cross-origin-request domains (without http/https protocols) allowed to access <em>/api/submission/public</em>.</span>)}
      />
    </div>
  )
}

SubmissionsPane.propTypes = {
  tempConfig: PropTypes.object,
  setTempConfig: PropTypes.func.isRequired
}

export default SubmissionsPane
