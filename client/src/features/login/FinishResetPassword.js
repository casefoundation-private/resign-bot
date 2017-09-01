import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  completePasswordReset
} from '../../actions/user';

class FinishResetPassword extends Component {
  componentDidMount() {
    if (this.props.match.params.resetCode) {
      this.props.completePasswordReset(this.props.match.params.resetCode);
    } else {
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <div className="text-center">
        Resetting your account
      </div>
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
    completePasswordReset
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(FinishResetPassword);
