import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button } from 'reactstrap';
import {
  loadUsers,
  reassignUserReviews
} from '../../actions/users';
import PageWrapper from '../../PageWrapper';
import { Link } from 'react-router-dom';
import {
  round
} from '../../misc/utils';
import FontAwesome from 'react-fontawesome';

class Users extends Component {
  componentDidMount() {
    this.props.loadUsers();
  }

  render() {
    return (
      <PageWrapper title="Users">
        <p>
          <Link to="/users/new" className="btn btn-success btn-sm"><FontAwesome name="user-plus" /> Add User Profile</Link>
        </p>
        <Table striped>
          <thead>
            <tr>
              <th>Email</th>
              <th>Pending Reviews</th>
              <th>Completed Reviews</th>
              <th>Average Score Given</th>
              <th>Active (Can Log In)</th>
              <th>Review Queue is Open</th>
              <th>Role</th>
              <th>Created</th>
              <th className="text-center">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.users.users && this.props.users.users.map((user) => {
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.pendingReviews}</td>
                    <td>{user.completedReviews}</td>
                    <td>{user.averageScore === null ? 'N/A' : round(user.averageScore)}</td>
                    <td>{user.active ? 'Yes' : 'No'}</td>
                    <td>{user.ready ? 'Yes' : 'No'}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="text-center">
                      <ButtonGroup>
                        <Link to={'/users/'+user.id} className="btn btn-primary btn-sm"><FontAwesome name="user" /> Edit User Profile</Link>
                        <Button size="sm" color="warning" onClick={() => this.props.reassignUserReviews(user)}><FontAwesome name="external-link-square" /> Reassign Reviews</Button>
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
    loadUsers,
    reassignUserReviews
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Users);
