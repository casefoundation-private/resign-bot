import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table,ButtonGroup,Button } from 'reactstrap';
import {
  loadReviewsForUser,
  recuseReview
} from '../../actions/reviews';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

class MyReviews extends Component {
  componentDidMount() {
    this.props.loadReviewsForUser(this.props.user.user.id);
  }

  renderReviewList(reviews) {
    return reviews ? (
      <Table striped>
        <thead>
          <tr>
            <th width="30%">Name</th>
            <th width="30%">Created</th>
            <th width="40%" className="text-center">Options</th>
          </tr>
        </thead>
        <tbody>
          {
            reviews.map((review) => {
              return (
                <tr key={review.id}>
                  <td>{summarizeSubmission(review.submission)}</td>
                  <td>{new Date(review.created_at).toLocaleDateString()}</td>
                  <td className="text-center">
                    <ButtonGroup>
                      { review.score === null && (<Button size="sm" color="danger" onClick={() => this.props.recuseReview(review)}><FontAwesome name="ban" /> Recuse Myself</Button>)}
                      <Link to={'/reviews/'+review.id} className="btn btn-primary btn-sm" disabled={review.score !== null}><FontAwesome name="check-square" /> Review Submission</Link>
                    </ButtonGroup>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    ) : null;
  }

  render() {
    return (
      <PageWrapper title="My Review Queue">
        { this.renderReviewList(this.props.reviews.reviews && this.props.reviews.reviews.filter((review) => review.score === null)) }
        <h4>Completed Reviews</h4>
        { this.renderReviewList(this.props.reviews.reviews && this.props.reviews.reviews.filter((review) => review.score !== null)) }
      </PageWrapper>
    );
  }
}

const stateToProps = (state) => {
  return {
    reviews: state.reviews,
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadReviewsForUser,
    recuseReview
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(MyReviews);
