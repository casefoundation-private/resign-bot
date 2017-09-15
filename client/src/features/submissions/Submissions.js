import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button,UncontrolledTooltip } from 'reactstrap';
import {
  loadSubmissions,
  toggleFlagSubmission,
  togglePinSubmission,
  downloadSubmissions
} from '../../actions/submissions';
import {
  makeFavorite,
  deleteFavorite
} from '../../actions/user';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  completedReviews,
  incompletedReviews,
  getFavorite,
  round
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

class Submissions extends Component {
  componentDidMount() {
    this.props.loadSubmissions();
  }

  render() {
    return (
      <PageWrapper title="Submissions">
      <p>
        <Button size="sm" color="primary" onClick={() => this.props.downloadSubmissions()}><FontAwesome name="download" /> Download Submissions</Button>
      </p>
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
              <th>Std Deviation</th>
              <th>Completed Reviews</th>
              <th>Assigned Reviews</th>
              <th>Created</th>
              <th className="text-center">
                Favorite{' '}
                <FontAwesome name="question-circle" id="favorite-tooltip" />
                <UncontrolledTooltip placement="below" target="favorite-tooltip">
                  This is a marker that only you control. Your favorites are differnet than other users' favorites so that you can mark the submissions you are most interested in tracking.
                </UncontrolledTooltip>
              </th>
              <th className="text-center">
                Pinned{' '}
                <FontAwesome name="question-circle" id="pinned-tooltip" />
                <UncontrolledTooltip placement="below" target="pinned-tooltip">
                  Pinning a submission is a global change. If you pin a submisison here, it will be pinned for all other users.
                </UncontrolledTooltip>
              </th>
              <th className="text-center">
                Flagged{' '}
                <FontAwesome name="question-circle" id="flagged-tooltip" />
                <UncontrolledTooltip placement="below" target="flagged-tooltip">
                  Flagging a submission is a global change. If you flag a submisison here, it will be flagged for all other users.
                </UncontrolledTooltip>
              </th>
              <th className="text-center">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.submissions.submissions && this.props.submissions.submissions.map((submission) => {
                const favorite = getFavorite(this.props.user.favorites,submission);
                return (
                  <tr key={submission.id}>
                    <td>{summarizeSubmission(submission)}</td>
                    <td>{submission.score === null ? 'N/A' : round(submission.score)}</td>
                    <td>{submission.deviation === null ? 'N/A' : round(submission.deviation)}</td>
                    <td>{completedReviews(submission).length}</td>
                    <td>{incompletedReviews(submission).length}</td>
                    <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td className="text-center">
                      { !favorite ?
                        ( <Button size="sm" color="secondary" onClick={() => this.props.makeFavorite(submission)}><FontAwesome name="star" /></Button> )
                        : ( <Button size="sm" color="success" onClick={() => this.props.deleteFavorite(favorite)}><FontAwesome name="star" /></Button> )
                      }
                    </td>
                    <td className="text-center">
                      <Button size="sm" color={submission.pinned ? 'success' : 'secondary'} onClick={() => this.props.togglePinSubmission(submission)}>
                        <FontAwesome name="circle" />
                      </Button>
                    </td>
                    <td className="text-center">
                      <Button size="sm" color={submission.flagged ? 'danger' : 'secondary'} onClick={() => this.props.toggleFlagSubmission(submission)}>
                        <FontAwesome name="exclamation-triangle" />
                      </Button>
                    </td>
                    <td className="text-center">
                      <ButtonGroup>
                      <Link to={'/submissions/'+submission.id} className="btn btn-primary btn-sm"><FontAwesome name="eye" /> View Submission</Link>
                        <Link to={'/submissions/'+submission.id+'/reviews'} className="btn btn-primary btn-sm"><FontAwesome name="list" /> Manage Reviews</Link>
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
    submissions: state.submissions,
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmissions,
    toggleFlagSubmission,
    togglePinSubmission,
    makeFavorite,
    deleteFavorite,
    downloadSubmissions
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Submissions);
