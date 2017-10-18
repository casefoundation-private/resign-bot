import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,Form,Input,FormGroup,Button,ButtonGroup,Modal,ModalHeader,ModalBody,ModalFooter } from 'reactstrap';
import {
  loadSubmission
} from '../../actions/submissions';
import {
  loadReviewsForSubmission,
  updateReview,
  setActiveReview,
  newReviewForSubmission,
  deleteReview
} from '../../actions/reviews';
import {
  loadUsers
} from '../../actions/users';
import {
  round,
  Spinner
} from '../../misc/utils';
import FontAwesome from 'react-fontawesome';
import ReviewSummary from './ReviewSummary';

class SubmissionReviews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewSummaryModal: false
    };
  }

  openReviewSummaryModal() {
    this.setState({reviewSummaryModal: true})
  }

  closeReviewSummaryModal() {
    this.setState({reviewSummaryModal: false})
  }

  componentDidMount() {
    const submissionId = parseInt(this.props.submissionId || this.props.match.params.submissionId,10);
    this.props.loadSubmission(submissionId);
    this.props.loadReviewsForSubmission(submissionId);
    this.props.loadUsers();
  }

  updateReviewOwner(review,newUserId) {
    if (review.score === null) {
      review.user_id = newUserId;
      this.props.setActiveReview(review);
      this.props.updateReview();
    }
  }

  viewReviewDetails(review) {
    this.props.setActiveReview(review);
    this.openReviewSummaryModal();
  }

  deleteReview(review) {
    this.props.setActiveReview(review);
    this.props.deleteReview();
  }

  render() {
    return (
      <div>
        <p>
          { this.props.submissions.submission && (<Button size="sm" color="success" onClick={() => this.props.newReviewForSubmission(this.props.submissions.submission.id)}><FontAwesome name="user-plus" /> Add Review</Button>) }
        </p>
        <Table striped>
          <thead>
            <tr>
              <th>Assigned To</th>
              <th>Flagged as Inappropriate</th>
              <th>Score</th>
              <th className="text-center">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.reviews.reviews ? this.props.reviews.reviews.map((review) => {
                return (
                  <tr key={review.id}>
                    <td>
                      <Form inline>
                        <FormGroup>
                          <Input disabled={review.score !== null} type="select" value={review.user_id} onChange={(event) => this.updateReviewOwner(review,event.target.value)}>
                            {
                              this.props.users.users && this.props.users.users.map((user) => (<option value={user.id} key={user.id}>{user.email}</option>))
                            }
                          </Input>
                        </FormGroup>
                      </Form>
                    </td>
                    <td>{review.flagged ? 'Yes' : 'No'}</td>
                    <td>{review.score === null ? 'N/A' : round(review.score)}</td>
                    <td className="text-center">
                    <ButtonGroup>
                      <Button onClick={() => this.deleteReview(review)} color="danger" size="sm"><FontAwesome name="trash" /> Remove</Button>
                      <Button onClick={() => this.viewReviewDetails(review)} color="primary" size="sm"><FontAwesome name="eye" /> View Details</Button>
                    </ButtonGroup>
                    </td>
                  </tr>
                )
              }) : (<Spinner />)
            }
          </tbody>
        </Table>
        <Modal isOpen={this.state.reviewSummaryModal} toggle={() => this.closeReviewSummaryModal()} size="lg">
          <ModalHeader toggle={() => this.closeReviewSummaryModal()}>
            Review Summary
          </ModalHeader>
          <ModalBody>
            <ReviewSummary review={this.props.reviews.review} prompts={this.props.config.review.prompts} categories={this.props.config.review.categories} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.closeReviewSummaryModal()}>Done</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const stateToProps = (state) => {
  return {
    submissions: state.submissions,
    users: state.users,
    reviews: state.reviews,
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmission,
    loadUsers,
    loadReviewsForSubmission,
    setActiveReview,
    updateReview,
    newReviewForSubmission,
    deleteReview
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(SubmissionReviews);
