import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  userLogout
} from '../actions/user'
import PropTypes from 'prop-types'

class Logout extends Component {
  componentDidMount () {
    this.props.userLogout()
  }

  render () {
    return (
      <div className='text-center'>
        Logging You Out
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    userLogout
  }, dispatch)
}

Logout.propTypes = {
  userLogout: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(Logout)
