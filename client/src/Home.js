import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PageWrapper from './PageWrapper';

class Home extends Component {
  render() {
    return (
      <PageWrapper user={this.props.user}>
        Home!
      </PageWrapper>
    );
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

export default connect(stateToProps, dispatchToProps)(Home);
