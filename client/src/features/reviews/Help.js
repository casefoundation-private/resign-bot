import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PageWrapper from '../../PageWrapper'
import PropTypes from 'prop-types'

class Help extends Component {
  render () {
    return (
      <PageWrapper title={null}>
        <div className='help-content' dangerouslySetInnerHTML={{__html: this.props.config.helpText}} />
      </PageWrapper>
    )
  }
}

const stateToProps = (state) => {
  return {
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  }, dispatch)
}

Help.propTypes = {
  config: PropTypes.shape({
    helpText: PropTypes.string.isRequird
  })
}

export default connect(stateToProps, dispatchToProps)(Help)
