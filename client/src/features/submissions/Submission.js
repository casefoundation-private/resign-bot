import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  loadSubmission
} from '../../actions/submissions'
import PageWrapper from '../../PageWrapper'
import { Link } from 'react-router-dom'
import {
  summarizeSubmission,
  SubmissionContents
} from '../../misc/utils'
import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'

class Submission extends Component {
  componentDidMount () {
    const submissionId = parseInt(this.props.match.params.submissionId, 10)
    this.props.loadSubmission(submissionId)
  }

  render () {
    return (
      <PageWrapper title={'Submission for ' + summarizeSubmission(this.props.submissions.submission)}>
        <p>
          <Link to='/submissions'><FontAwesome name='chevron-left' /> Back to Submissions</Link>
        </p>
        <SubmissionContents submission={this.props.submissions.submission} />
      </PageWrapper>
    )
  }
}

const stateToProps = (state) => {
  return {
    submissions: state.submissions
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmission
  }, dispatch)
}

Submission.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      submissionId: PropTypes.string.isRequired
    })
  }),
  loadSubmission: PropTypes.func.isRequired,
  submissions: PropTypes.shape({
    submission: PropTypes.object
  })
}

export default connect(stateToProps, dispatchToProps)(Submission)
