import React, { Component } from 'react';
import { HashRouter,Route,Switch,Redirect } from 'react-router-dom';
import Login from './features/login/Login';
import ResetPassword from './features/login/ResetPassword';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Logout from './misc/Logout';
import Users from './features/userManagement/Users';
import User from './features/userManagement/User';
import Submissions from './features/submissions/Submissions';
import Submission from './features/submissions/Submission';
import SubmissionReviews from './features/submissions/SubmissionReviews';
import FinishResetPassword from './features/login/FinishResetPassword';
import MyReviews from './features/reviews/MyReviews';
import Review from './features/reviews/Review';
import NotificationQueue from './features/admin/NotificationQueue';
import Help from './features/reviews/Help';
import {
  loadUserDetails
} from './actions/user';

class App extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.user.token && nextProps.user.token) {
      this.props.loadUserDetails();
    }
  }

  render() {
    return this.props.user.token && !this.props.user.needsPasswordReset ?
      ( <HashRouter>
        <Switch>
          <Redirect from="/login" exact={true} to="/" />
          <Route path="/logout" exact={true} component={Logout} />
          { this.props.user.user && this.props.user.user.role === 'admin' && (<Route path="/users" exact={true} component={Users} />) }
          { this.props.user.user && this.props.user.user.role === 'admin' && (<Route path="/notifications" exact={true} component={NotificationQueue} />) }
          <Route path="/users/:userId" exact={true} component={User} />
          <Route path="/submissions" exact={true} component={Submissions} />
          <Route path="/submissions/:submissionId" exact={true} component={Submission} />
          <Route path="/submissions/:submissionId/reviews" exact={true} component={SubmissionReviews} />
          <Route path="/reviews" exact={true} component={MyReviews} />
          <Route path="/reviews/:reviewId" exact={true} component={Review} />
          <Route path="/help" exact={true} component={Help} />
          { this.props.user.user && this.props.user.user.role === 'admin' ?
            (<Redirect from="/" to="/submissions" />)
            : (<Redirect from="/" to="/reviews" />)
          }
        </Switch>
      </HashRouter> )
      : (<HashRouter>
        <Switch>
          <Route path="/login" exact={true} component={Login} />
          <Route path="/reset" exact={true} component={ResetPassword} />
          <Route path="/reset/:resetCode" exact={true} component={FinishResetPassword} />
          <Redirect from="/" to="/login" />
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
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(App);
