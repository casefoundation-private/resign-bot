import React, { Component } from 'react';
import { HashRouter,Route,Switch,Redirect } from 'react-router-dom';
import Login from './features/login/Login';
import ResetPassword from './features/login/ResetPassword';
import Home from './Home';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Logout from './Logout';
import Users from './features/userManagement/Users';
import User from './features/userManagement/User';
import Submissions from './features/submissions/Submissions';
import SubmissionReviews from './features/submissions/SubmissionReviews';
import FinishResetPassword from './features/login/FinishResetPassword';

class App extends Component {
  render() {
    return this.props.user.token ?
      ( <HashRouter>
        <Switch>
          <Redirect from="/login" exact={true} to="/" />
          <Route path="/logout" exact={true} component={Logout} />
          { this.props.user.user.role === 'admin' && (<Route path="/users" exact={true} component={Users} />) }
          <Route path="/users/:userId" exact={true} component={User} />
          <Route path="/submissions" exact={true} component={Submissions} />
          <Route path="/submissions/:submissionId/reviews" exact={true} component={SubmissionReviews} />
          <Route path="/" component={Home} />
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
  return bindActionCreators({}, dispatch);
}

export default connect(stateToProps, dispatchToProps)(App);
