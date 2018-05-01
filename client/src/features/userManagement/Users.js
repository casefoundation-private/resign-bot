import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, ButtonGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap'
import {
  loadUsers,
  reassignUserReviews,
  setActiveUser
} from '../../actions/users'
import PageWrapper from '../../PageWrapper'
import { Link } from 'react-router-dom'
import {
  round,
  paginate,
  Spinner
} from '../../misc/utils'
import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'

class Users extends Component {
  constructor (props) {
    super(props)
    this.state = {
      reassignModal: false,
      reassignCount: 0,
      reassignUser: null,
      page: 0
    }
  }

  openReassignModal (user) {
    this.props.setActiveUser(user)
    this.setState({
      reassignModal: true,
      reassignCount: user.pendingReviews,
      reassignUser: null
    })
  }

  closeReassignModal () {
    this.setState({reassignModal: false})
  }

  reassignUserReviews () {
    this.props.reassignUserReviews(this.state.reassignCount, this.state.reassignUser)
    this.closeReassignModal()
  }

  componentDidMount () {
    this.props.loadUsers()
  }

  render () {
    return (
      <div>
        <PageWrapper title='Users'>
          <p>
            <Link to='/users/new' className='btn btn-success btn-sm'><FontAwesome name='user-plus' /> Add User Profile</Link>
          </p>
          {
            this.props.users.users ? paginate(this.props.users.users, this.props.config.config.perPage, this.state.page,
              (page) => {
                this.setState({page})
              },
              (users) => {
                return (
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
                        <th className='text-center'>Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        users.map((user) => {
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
                              <td className='text-center'>
                                <ButtonGroup>
                                  <Link to={'/users/' + user.id} className='btn btn-primary btn-sm'><FontAwesome name='user' /> Edit User Profile</Link>
                                  <Button size='sm' color='warning' onClick={() => this.openReassignModal(user)}><FontAwesome name='external-link-square' /> Reassign Reviews</Button>
                                </ButtonGroup>
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                )
              }) : (<Spinner />)
          }
        </PageWrapper>
        <Modal isOpen={this.state.reassignModal} toggle={() => this.closeReassignModal()} size='lg'>
          <ModalHeader toggle={() => this.closeReassignModal()}>
            Reassign Reviews For {this.props.users.user && this.props.users.user.email}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for='count'>Number</Label>
              <Input type='number' value={this.state.reassignCount} onChange={(event) => this.setState({'reassignCount': Math.min(parseInt(event.target.value, 10), this.props.users.user.pendingReviews)})} id='count' name='count' />
            </FormGroup>
            <FormGroup>
              <Label for='user'>Preferred New User</Label>
              <Input name='user' type='select' value={this.state.reassignUser || ''} onChange={(event) => this.setState({'reassignUser': event.target.value.length > 0 ? parseInt(event.target.value, 10) : null})}>
                <option value=''>Any User</option>
                {
                  this.props.users.user &&
                    this.props.users.users &&
                    this.props.users.users
                      .filter((user) => user.id !== this.props.users.user.id)
                      .map((user) => (<option value={user.id} key={user.id}>{user.email}</option>))
                }
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={() => this.closeReassignModal()}>Cancel</Button>
            <Button color='warning' onClick={() => this.reassignUserReviews()}>Reassign</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    users: state.users,
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadUsers,
    reassignUserReviews,
    setActiveUser
  }, dispatch)
}

Users.propTypes = {
  loadUsers: PropTypes.func.isRequired,
  reassignUserReviews: PropTypes.func.isRequired,
  setActiveUser: PropTypes.func.isRequired,
  users: PropTypes.shape({
    users: PropTypes.array,
    user: PropTypes.shape({
      email: PropTypes.string,
      pendingReviews: PropTypes.number,
      id: PropTypes.number
    })
  }),
  config: PropTypes.shape({
    config: PropTypes.shape({
      perPage: PropTypes.number
    })
  })
}

export default connect(stateToProps, dispatchToProps)(Users)
