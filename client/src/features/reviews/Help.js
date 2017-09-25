import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PageWrapper from '../../PageWrapper';


class Help extends Component {
  render() {
    return (
      <PageWrapper title="Help">
        <div dangerouslySetInnerHTML={{__html:this.props.config.helpText}} />
      </PageWrapper>
    );
  }
}

const stateToProps = (state) => {
  return {
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Help);
