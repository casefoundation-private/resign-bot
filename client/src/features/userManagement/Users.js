import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button,Modal,ModalHeader,ModalBody,ModalFooter,FormGroup,Label,Input } from 'reactstrap';
import {
  loadUsers,
  reassignUserReviews,
  setActiveUser
} from '../../actions/users';
import PageWrapper from '../../PageWrapper';
import { Link } from 'react-router-dom';
import {
  round
} from '../../misc/utils';
import FontAwesome from 'react-fontawesome';

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reassignModal: false,
      reassignCount: 0
    };
  }

  openReassignModal(user) {
    this.props.setActiveUser(user);
    this.setState({
      reassignModal: true,
      reassignCount: user.pendingReviews
    })
  }

  closeReassignModal() {
    this.setState({reassignModal: false});
  }

  reassignUserReviews() {
    this.props.reassignUserReviews(this.state.reassignCount);
    this.closeReassignModal();
  }

  componentDidMount() {
    this.props.loadUsers();
  }

  render() {
    return (
      <div>
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
                          <Button size="sm" color="warning" onClick={() => this.openReassignModal(user)}><FontAwesome name="external-link-square" /> Reassign Reviews</Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </PageWrapper>
        <Modal isOpen={this.state.reassignModal} toggle={() => this.closeReassignModal()} size="lg">
          <ModalHeader toggle={() => this.closeReassignModal()}>
            Reassign Reviews For {this.props.users.user.email}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="count">Number</Label>
              <Input type="number" value={this.state.reassignCount} onChange={(event) => this.setState({'reassignCount':Math.min(parseInt(event.target.value,10),this.props.users.user.pendingReviews)})} id="count" name="count" />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.closeReassignModal()}>Cancel</Button>
            <Button color="warning" onClick={() => this.reassignUserReviews()}>Reassign</Button>
          </ModalFooter>
        </Modal>
      </div>
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
    reassignUserReviews,
    setActiveUser
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Users);
