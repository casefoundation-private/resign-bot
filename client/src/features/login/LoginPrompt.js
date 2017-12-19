import React, { Component } from 'react'
import {Card, CardBlock, CardTitle, Alert} from 'reactstrap'
import './LoginPrompt.css'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  clearMessage
} from '../../actions/message'
import PropTypes from 'prop-types'

class LoginPrompt extends Component {
  clearAlert () {
    this.props.clearMessage()
  }

  render () {
    return (
      <Card className='login-card'>
        <CardBlock className='card-body'>
          <CardTitle>{this.props.title}</CardTitle>
          { this.props.message.message ? <Alert color={this.props.message.messageType} toggle={() => this.clearAlert()}>{this.props.message.message}</Alert> : null }
          { this.props.children }
        </CardBlock>
      </Card>
    )
  }
}

const stateToProps = (state) => {
  return {
    message: state.message
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    clearMessage
  }, dispatch)
}

LoginPrompt.propTypes = {
  clearMessage: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string.isRequired,
    messageType: PropTypes.string.isRequired
  }),
  children: PropTypes.element.isRequired
}

export default connect(stateToProps, dispatchToProps)(LoginPrompt)
