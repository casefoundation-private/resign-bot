import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,Form,Input,FormGroup,Button,ButtonGroup } from 'reactstrap';
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
  round
} from '../../misc/utils';
import FontAwesome from 'react-fontawesome';

class SubmissionReviews extends Component {
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
              <th>Score</th>
              <th className="text-center">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.reviews.reviews && this.props.reviews.reviews.map((review) => {
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
                    <td>{review.score === null ? 'N/A' : round(review.score)}</td>
                    <td className="text-center">
                    <ButtonGroup>
                      <Button onClick={() => this.deleteReview(review)} color="danger" size="sm"><FontAwesome name="trash" /> Remove</Button>
                    </ButtonGroup>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </div>
    );
  }
}

const stateToProps = (state) => {
  return {
    submissions: state.submissions,
    users: state.users,
    reviews: state.reviews
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
