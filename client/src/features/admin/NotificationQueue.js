import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table } from 'reactstrap'
import {
  loadNotifications
} from '../../actions/notifications'
import PageWrapper from '../../PageWrapper'
import {
  Spinner
} from '../../misc/utils'
import PropTypes from 'prop-types'

class NotificationQueue extends Component {
  componentDidMount () {
    this.props.loadNotifications()
  }

  render () {
    return (
      <PageWrapper title='Notification Queue'>
        <Table striped>
          <thead>
            <tr>
              <th>Created</th>
              <th>Updated</th>
              <th>User</th>
              <th>Type</th>
              <th>Errored</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.notifications.notifications ? this.props.notifications.notifications.map((notification) => {
                return (
                  <tr key={notification.id}>
                    <td>{new Date(notification.user.created_at).toLocaleString()}</td>
                    <td>{new Date(notification.user.updated_at).toLocaleString()}</td>
                    <td>{notification.user.email}</td>
                    <td>{notification.type}</td>
                    <td>{notification.errored ? 'Yes' : 'No'}</td>
                    <td>
                      <pre>
                        {JSON.stringify(notification.data, null, '  ')}
                      </pre>
                    </td>
                  </tr>
                )
              }) : (<Spinner />)
            }
          </tbody>
        </Table>
      </PageWrapper>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    notifications: state.notifications
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadNotifications
  }, dispatch)
}

NotificationQueue.propTypes = {
  notifications: PropTypes.shape({
    notifications: PropTypes.array.isRequired
  }),
  loadNotifications: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(NotificationQueue)
