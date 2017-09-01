import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup } from 'reactstrap';
import {
  loadSubmissions
} from '../../actions/submissions';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  completedReviews,
  incompletedReviews
} from './utils';
import { Link } from 'react-router-dom';

class Submissions extends Component {
  componentDidMount() {
    this.props.loadSubmissions();
  }

  render() {
    return (
      <PageWrapper title="Submissions">
        <Table striped>
          <thead>
            <tr>
              <th>Summary</th>
              <th>Score</th>
              <th>Completed Reviews</th>
              <th>Assigned Reviews</th>
              <th>Created</th>
              <th className="text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.submissions.submissions && this.props.submissions.submissions.map((submission) => {
                return (
                  <tr key={submission.id}>
                    <td>{summarizeSubmission(submission)}</td>
                    <td>{submission.score}</td>
                    <td>{completedReviews(submission).length}</td>
                    <td>{incompletedReviews(submission).length}</td>
                    <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <ButtonGroup>
                        <Link to={'/submissions/'+submission.id+'/reviews'} className="btn btn-primary btn-sm">Manage Reviews</Link>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </PageWrapper>
    );
  }
}

const stateToProps = (state) => {
  return {
    submissions: state.submissions
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmissions
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Submissions);
