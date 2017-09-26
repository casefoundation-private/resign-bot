import React, { Component } from 'react';
import {Form,Button,Label,Input,FormGroup} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  userLogin
} from '../../actions/user';
import {
  clearMessage
} from '../../actions/message';
import { Link } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'email': null,
      'password': null
    }
  }

  componentDidMount() {
    this.props.clearMessage();
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.userLogin(this.state);
    this.props.clearMessage();
  }

  render() {
    return (
      <LoginPrompt title="Login">
        <Form onSubmit={(event) => this.handleSubmit(event)}>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input type="email" name="email" id="email" onChange={(event) => this.setState({'email':event.target.value})} required />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input type="password" name="password" id="password" onChange={(event) => this.setState({'password':event.target.value})} required />
          </FormGroup>
          <Button color="primary">Login</Button>
        </Form>
        <p className="login-forgot-password">
          <Link to="/reset">Forgot your password?</Link>
        </p>
      </LoginPrompt>
    );
  }
}

const stateToProps = (state) => {
  return {
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    userLogin,
    clearMessage
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Login);
