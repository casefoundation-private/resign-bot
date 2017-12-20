import React, { Component } from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import Login from './features/login/Login'
import ResetPassword from './features/login/ResetPassword'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Logout from './misc/Logout'
import Users from './features/userManagement/Users'
import User from './features/userManagement/User'
import Submissions from './features/submissions/Submissions'
import FinishResetPassword from './features/login/FinishResetPassword'
import MyReviews from './features/reviews/MyReviews'
import Review from './features/reviews/Review'
import NotificationQueue from './features/admin/NotificationQueue'
import Help from './features/reviews/Help'
import Submission from './features/submissions/Submission'
import {
  loadUserDetails
} from './actions/user'
import PropTypes from 'prop-types'

class App extends Component {
  componentWillReceiveProps (nextProps) {
    if (!this.props.user.token && nextProps.user.token) {
      this.props.loadUserDetails()
    }
  }

  componentDidMount () {
    if (this.props.user.token) {
      this.props.loadUserDetails()
    }
  }

  render () {
    return this.props.user.token && !this.props.user.needsPasswordReset
      ? (<HashRouter>
        <Switch>
          <Redirect from='/login' exact to='/' />
          <Route path='/logout' exact component={Logout} />
          { this.props.user.user && this.props.user.user.role === 'admin' && (<Route path='/users' exact component={Users} />) }
          { this.props.user.user && this.props.user.user.role === 'admin' && (<Route path='/notifications' exact component={NotificationQueue} />) }
          <Route path='/users/:userId' exact component={User} />
          <Route path='/submissions' exact component={Submissions} />
          <Route path='/submissions/:submissionId' exact component={Submission} />
          <Route path='/reviews' exact component={MyReviews} />
          <Route path='/reviews/:reviewId' exact component={Review} />
          <Route path='/help' exact component={Help} />
          { this.props.user.user && this.props.user.user.role === 'admin'
            ? (<Redirect from='/' to='/submissions' />)
            : (<Redirect from='/' to='/reviews' />)
          }
        </Switch>
      </HashRouter>)
      : (<HashRouter>
        <Switch>
          <Route path='/login' exact component={Login} />
          <Route path='/reset' exact component={ResetPassword} />
          <Route path='/reset/:resetCode' exact component={FinishResetPassword} />
          <Redirect from='/' to='/login' />
        </Switch>
      </HashRouter>)
  }
}

const stateToProps = (state) => {
  return {
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadUserDetails
  }, dispatch)
}

App.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string,
    needsPasswordReset: PropTypes.bool,
    user: PropTypes.shape({
      role: PropTypes.string
    })
  }),
  loadUserDetails: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(App)
