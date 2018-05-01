import React from 'react'
import PropTypes from 'prop-types'
import {ConfigurationField} from '../../../misc/utils'

const RestrictionsPane = (props) => {
  return (
    <div>
      <ConfigurationField
        label={'Max Pinnable Submissions'}
        name={'pinnedLimit'}
        type={'number'}
        tempConfig={props.tempConfig}
        setTempConfig={props.setTempConfig}
        help={(<span>Maximum number of submissions that may be <em>pinned</em>.</span>)}
      />
      <ConfigurationField
        label={'Max Reviews Per Submission'}
        name={'reviewLimit'}
        type={'number'}
        tempConfig={props.tempConfig}
        setTempConfig={props.setTempConfig}
        help={(<span>Maximum number of reviews that may be done on an individual submission.</span>)}
      />
    </div>
  )
}

RestrictionsPane.propTypes = {
  tempConfig: PropTypes.object,
  setTempConfig: PropTypes.func.isRequired
}

export default RestrictionsPane
