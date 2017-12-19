import React, { Component } from 'react'
import {Form, Button, Label, Input, FormGroup} from 'reactstrap'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  completePasswordReset
} from '../../actions/user'
import {
  loadUser,
  setActiveUserProp,
  updateUser
} from '../../actions/users'
import LoginPrompt from './LoginPrompt'
import PropTypes from 'prop-types'

class FinishResetPassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      'secondPassword': null
    }
  }

  componentDidMount () {
    if (this.props.match.params.resetCode) {
      this.props.completePasswordReset(this.props.match.params.resetCode)
    } else {
      this.props.history.push('/')
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.user.token && !this.props.user.token) {
      this.props.loadUser(newProps.user.user.id)
    }
  }

  password1Updated (event) {
    this.props.setActiveUserProp('password', event.target.value)
  }

  password2Updated (event) {
    this.setState({
      'secondPassword': event.target.value
    })
  }

  handleSubmit (event) {
    event.preventDefault()
    if (this.passwordIsValid()) {
      this.props.updateUser()
    }
  }

  passwordIsValid () {
    return this.state.secondPassword === this.props.users.user.password
  }

  render () {
    if (this.props.user.token && this.props.users.user && this.props.user.needsPasswordReset) {
      return (
        <LoginPrompt title='Login'>
          <Form onSubmit={(event) => this.handleSubmit(event)}>
            <p>Your password has been reset. Please enter a new password below to continue:</p>
            <FormGroup>
              <Label for='password'>Password</Label>
              <Input autoComplete={false} type='password' name='password' id='password' value={this.props.users.user.password || ''} onChange={(event) => this.password1Updated(event)} />
            </FormGroup>
            <FormGroup>
              <Label for='password2'>Confirm Password</Label>
              <Input autoComplete={false} type='password' name='password2' id='password2' onChange={(event) => this.password2Updated(event)} />
            </FormGroup>
            <Button disabled={!this.passwordIsValid()} color='primary'>Set New Password</Button>
          </Form>
        </LoginPrompt>
      )
    } else {
      return (
        <div className='text-center'>
          Resetting your account
        </div>
      )
    }
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    users: state.users
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    completePasswordReset,
    loadUser,
    setActiveUserProp,
    updateUser
  }, dispatch)
}

FinishResetPassword.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      resetCode: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  user: PropTypes.shape({
    token: PropTypes.string.isRequired,
    needsPasswordReset: PropTypes.bool.isRequired
  }),
  users: PropTypes.shape({
    user: PropTypes.shape({
      password: PropTypes.string
    })
  }),
  completePasswordReset: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
  setActiveUserProp: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(FinishResetPassword)
