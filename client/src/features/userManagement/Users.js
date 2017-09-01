import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup } from 'reactstrap';
import {
  loadUsers
} from '../../actions/users';
import PageWrapper from '../../PageWrapper';
import { Link } from 'react-router-dom';

class Users extends Component {
  componentDidMount() {
    this.props.loadUsers();
  }

  render() {
    return (
      <PageWrapper title="Users">
        <p>
          <Link to="/users/new" className="btn btn-success btn-sm">Add User Profile</Link>
        </p>
        <Table striped>
          <thead>
            <tr>
              <th>Email</th>
              <th>Active</th>
              <th>Role</th>
              <th>Created</th>
              <th className="text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.users.users && this.props.users.users.map((user) => {
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.active ? 'Yes' : 'No'}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <ButtonGroup>
                        <Link to={'/users/'+user.id} className="btn btn-primary btn-sm">Edit User Profile</Link>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
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
    loadUsers
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Users);
