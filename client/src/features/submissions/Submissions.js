import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button,UncontrolledTooltip,Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
  round,
  SubmissionContents
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import SubmissionReviews from './SubmissionReviews';

class Submissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    };
  }

  openReviewEditorModel(submission) {
    this.setState({
      reviewEditorModal: true,
      submissionDetailModal: false,
      submission
    });
  }

  closeReviewEditorModel() {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    });
  }

  openSubmissionDetailModal(submission) {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: true,
      submission
    });
  }

  closeSubmissionDetailModal() {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    });
  }

  componentDidMount() {
    this.props.loadSubmissions();
  }

  render() {
    return (
      <div>
        <PageWrapper title={'Submissions (' + (this.props.submissions.submissions && this.props.submissions.submissions.length) + ' Total)'}>
        <p>
          <Button size="sm" color="primary" onClick={() => this.props.downloadSubmissions()}><FontAwesome name="download" /> Download Submissions</Button>
        </p>
          <Table striped>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Score</th>
                <th>Std Deviation</th>
                <th>Completed Reviews</th>
                <th>Assigned Reviews</th>
                <th>Flagged Reviews</th>
                <th>Created</th>
                <th className="text-center">
                  Favorite{' '}
                  <FontAwesome name="question-circle" id="favorite-tooltip" />
                  <UncontrolledTooltip placement="below" target="favorite-tooltip">
                    This is a marker that only you control. Your favorites are differnet than other users{'\''} favorites so that you can mark the submissions you are most interested in tracking.
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
                      <td>{submission.id}</td>
                      <td>{summarizeSubmission(submission)}</td>
                      <td>{submission.score === null ? 'N/A' : round(submission.score)}</td>
                      <td>{submission.deviation === null ? 'N/A' : round(submission.deviation)}</td>
                      <td>{completedReviews(submission).length}</td>
                      <td>{incompletedReviews(submission).length}</td>
                      <td>{submission.flags === null ? 'N/A' : submission.flags}</td>
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
                          <Button onClick={() => this.openSubmissionDetailModal(submission)} color="primary" size="sm"><FontAwesome name="eye" /> View Submission</Button>
                          <Button onClick={() => this.openReviewEditorModel(submission)} color="primary" size="sm"><FontAwesome name="list" /> Manage Reviews</Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </PageWrapper>
        <Modal isOpen={this.state.reviewEditorModal} toggle={() => this.closeReviewEditorModel()} size="lg">
          <ModalHeader toggle={() => this.closeReviewEditorModel()}>Submission Reviews for {summarizeSubmission(this.state.submission)}</ModalHeader>
          <ModalBody>
            <SubmissionReviews submissionId={this.state.submission && this.state.submission.id} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.closeReviewEditorModel()}>Done</Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.submissionDetailModal} toggle={() => this.closeSubmissionDetailModal()} size="lg">
          <ModalHeader toggle={() => this.closeSubmissionDetailModal()}>
            <Link to={'/submissions/'+(this.state.submission && this.state.submission.id)}>
              {summarizeSubmission(this.state.submission)}
            </Link>
          </ModalHeader>
          <ModalBody>
            <SubmissionContents submission={this.state.submission} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.closeSubmissionDetailModal()}>Done</Button>
          </ModalFooter>
        </Modal>
      </div>
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
