import React, { Component } from 'react'
import {Form, Button, Label, Input, FormGroup} from 'reactstrap'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  resetPassword
} from '../../actions/user'
import {
  clearMessage
} from '../../actions/message'
import LoginPrompt from './LoginPrompt'
import PropTypes from 'prop-types'

class ResetPassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      'email': null
    }
  }

  componentDidMount () {
    this.props.clearMessage()
  }

  clearAlert () {
    this.props.clearMessage()
  }

  handleSubmit (event) {
    event.preventDefault()
    this.props.resetPassword(this.state.email)
    this.props.clearMessage()
  }

  render () {
    return (
      <LoginPrompt title='Reset Password'>
        <p>Enter your email address below and we will email you a link to reset your password.</p>
        <Form onSubmit={(event) => this.handleSubmit(event)}>
          <FormGroup>
            <Label for='email'>Email</Label>
            <Input type='email' name='email' id='email' onChange={(event) => this.setState({'email': event.target.value})} required />
          </FormGroup>
          <Button color='primary'>Reset Password</Button>
        </Form>
      </LoginPrompt>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    message: state.message
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    clearMessage,
    resetPassword
  }, dispatch)
}

ResetPassword.propTypes = {
  clearMessage: PropTypes.func.isRequired,
  resetPassword: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(ResetPassword)
