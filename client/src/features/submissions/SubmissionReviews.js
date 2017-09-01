import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,Form,Input,FormGroup } from 'reactstrap';
import {
  loadSubmission
} from '../../actions/submissions';
import {
  loadReviews,
  updateReview,
  setActiveReview
} from '../../actions/reviews';
import {
  loadUsers
} from '../../actions/users';
import PageWrapper from '../../PageWrapper';
import { Link } from 'react-router-dom';
import {
  summarizeSubmission
} from './utils';

class Submissions extends Component {
  componentDidMount() {
    const submissionId = parseInt(this.props.match.params.submissionId,10);
    this.props.loadSubmission(submissionId);
    this.props.loadReviews(submissionId);
    this.props.loadUsers();
  }

  updateReviewOwner(review,newUserId) {
    review.user_id = newUserId;
    this.props.setActiveReview(review);
    this.props.updateReview();
  }

  render() {
    return (
      <PageWrapper title={'Submission Reviews for ' + summarizeSubmission(this.props.submissions.submission)}>
        <p>
          <Link to='/submissions'>Back to Submissions</Link>
        </p>
        <Table striped>
          <thead>
            <tr>
              <th>Assigned To</th>
              <th>Score</th>
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
                          <Input type="select" value={review.user_id} onChange={(event) => this.updateReviewOwner(review,event.target.value)}>
                            {
                              this.props.users.users && this.props.users.users.map((user) => (<option value={user.id} key={user.id}>{user.email}</option>))
                            }
                          </Input>
                        </FormGroup>
                      </Form>
                    </td>
                    <td>{review.score}</td>
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
    users: state.users,
    reviews: state.reviews
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmission,
    loadUsers,
    loadReviews,
    setActiveReview,
    updateReview
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Submissions);
