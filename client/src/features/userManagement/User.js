import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button,Form,Input,FormGroup,Label } from 'reactstrap';
import {
  loadUser,
  updateUser,
  newUser,
  setActiveUserProp
} from '../../actions/users';
import PageWrapper from '../../PageWrapper';

class User extends Component {
  componentDidMount() {
    if (this.props.match.params.userId && this.props.match.params.userId !== 'new') {
      this.props.loadUser(parseInt(this.props.match.params.userId,10));
    } else {
      this.props.newUser();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.userId === 'new' && nextProps.users.user.id > 0) {
      this.props.history.push('/users/'+nextProps.users.user.id);
    }
  }

  handleSave(event) {
    event.preventDefault();
    this.props.updateUser();
  }

  render() {
    return (
      <PageWrapper title={this.props.match.params.userId !== 'new' ? "Edit User" : "New User"}>
        { this.props.users.user && (<Form onSubmit={(event) => this.handleSave(event)}>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input autoComplete={false} name="email" type="email" id="email" value={this.props.users.user.email} disabled={this.props.user.user.role!=='admin'} onChange={(event) => this.props.setActiveUserProp('email',event.target.value)} required/>
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input autoComplete={false} type="password" name="password" id="password" value={this.props.users.user.password || ''} onChange={(event) => this.props.setActiveUserProp('password',event.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="role">Role</Label>
            <Input type="select" name="role" id="role" value={this.props.users.user.role} disabled={this.props.user.user.role!=='admin'} onChange={(event) => this.props.setActiveUserProp('role',event.target.value)} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Input>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="checkbox" name="active" id="active" checked={this.props.users.user.active} disabled={this.props.user.user.role!=='admin'} onChange={(event) => this.props.setActiveUserProp('active',event.target.checked)} />
              {' '}
              Active (Can Log In)
            </Label>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="checkbox" name="ready" id="ready" checked={this.props.users.user.ready} disabled={this.props.user.user.role!=='admin'} onChange={(event) => this.props.setActiveUserProp('ready',event.target.checked)} />
              {' '}
              Review Queue is Open
            </Label>
          </FormGroup>
          <br/>
          <Button color="primary" type="submit">Save</Button>
        </Form>)}
      </PageWrapper>
    );
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
    loadUser,
    updateUser,
    newUser,
    setActiveUserProp
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(User);
