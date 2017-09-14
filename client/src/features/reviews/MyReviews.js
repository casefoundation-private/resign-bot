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

class MyReviews extends Component {
  componentDidMount() {
    this.props.loadReviewsForUser(this.props.user.user.id);
  }

  render() {
    return (
      <PageWrapper title="My Review Queue">
        <Table striped>
          <thead>
            <tr>
              <th>Summary</th>
              <th>Created</th>
              <th className="text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.reviews.reviews && this.props.reviews.reviews.map((review) => {
                return (
                  <tr key={review.id}>
                    <td>{summarizeSubmission(review.submission)}</td>
                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <ButtonGroup>
                        <Button size="sm" color="danger" onClick={() => this.props.recuseReview(review)}>Recuse</Button>
                        <Link to={'/reviews/'+review.id} className="btn btn-primary btn-sm" disabled={review.score !== null}>Review</Link>
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
