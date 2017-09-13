import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button } from 'reactstrap';
import {
  loadSubmissions,
  toggleFlagSubmission,
  togglePinSubmission
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
  getFavorite
} from '../../misc/utils';
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
              <th>Std Deviation</th>
              <th>Completed Reviews</th>
              <th>Assigned Reviews</th>
              <th>Created</th>
              <th className="text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.submissions.submissions && this.props.submissions.submissions.map((submission) => {
                const favorite = getFavorite(this.props.user.favorites,submission);
                return (
                  <tr key={submission.id}>
                    <td>{summarizeSubmission(submission)}</td>
                    <td>{submission.score === null ? 'N/A' : submission.score}</td>
                    <td>{submission.deviation === null ? 'N/A' : submission.deviation}</td>
                    <td>{completedReviews(submission).length}</td>
                    <td>{incompletedReviews(submission).length}</td>
                    <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <ButtonGroup>
                        <Button size="sm" color="danger" onClick={() => this.props.toggleFlagSubmission(submission)}>
                          { !submission.flagged ? 'Flag as Inappropriate' : 'Clear Inappropriate Flag' }
                        </Button>
                        <Button size="sm" color="success" onClick={() => this.props.togglePinSubmission(submission)}>
                          { !submission.pinned ? 'Pin to Top' : 'Unpin' }
                        </Button>
                        { !favorite ?
                          ( <Button size="sm" color="success" onClick={() => this.props.makeFavorite(submission)}>Favorite</Button> )
                          : ( <Button size="sm" color="success" onClick={() => this.props.deleteFavorite(favorite)}>Unfavorite</Button> )
                        }
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
    deleteFavorite
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Submissions);
