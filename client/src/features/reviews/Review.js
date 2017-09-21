import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row,Col,Card,CardTitle,CardBlock,Form,Button,Label,Input,FormGroup } from 'reactstrap';
import {
  loadReview,
  setReviewPromptValue,
  updateReview,
  calculateAndUpdateReview,
  setReviewFlagged
} from '../../actions/reviews';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  getSubmissionFields,
  SubmissionContents
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

class Review extends Component {
  componentDidMount() {
    const reviewId = parseInt(this.props.match.params.reviewId,10);
    this.props.loadReview(reviewId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.reviews.review && this.props.reviews.review.score === null && nextProps.reviews.review.score !== null) {
      this.props.history.push('/reviews');
    }
  }

  renderReviewPrompts() {
    return this.props.reviews.review.data && this.props.reviews.review.data.prompts && this.props.config.review.prompts.map((prompt,i) => {
      return (
        <FormGroup key={i}>
          <Label for={'review_prompt_'+i}>
            <strong>{prompt.prompt}</strong>
          </Label>
          <Input type="select" value={this.props.reviews.review.data.prompts[i]} onChange={(event) => this.props.setReviewPromptValue(i,parseInt(event.target.value))}>
            {
              prompt.labels.map((label,j) => {
                return (<option value={j} key={j}>{j}: {label}</option>)
              })
            }
          </Input>
        </FormGroup>
      )
    });
  }

  render() {
    return (
      <PageWrapper title={'Reviewing ' + (this.props.reviews.review && summarizeSubmission(this.props.reviews.review.submission))}>
        <p>
          <Link to='/reviews'><FontAwesome name="chevron-left" /> Back to My Review Queue</Link>
        </p>
        <Row>
          <Col>
            <Card>
              <CardBlock className="card-body">
                <CardTitle>Submitted Information</CardTitle>
                <SubmissionContents submission={this.props.reviews.review && this.props.reviews.review.submission} />
              </CardBlock>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <CardBlock className="card-body">
                <CardTitle>My Review</CardTitle>
                <Form>
                  <p>
                    <FormGroup check>
                      <Label check>
                        <Input type="checkbox" name="review_flagged" value="flagged" checked={this.props.reviews.review && this.props.reviews.review.flagged} onChange={(event) => this.props.setReviewFlagged(event.target.checked)} />{' '}
                        <strong>Flag as Inappropriate</strong>
                      </Label>
                    </FormGroup>
                  </p>
                  { this.renderReviewPrompts() }
                  <p>
                    <Button color="primary" onClick={() => this.props.updateReview()}><FontAwesome name="check-circle-o" /> Save</Button>
                    { ' ' }
                    <Button color="warning" onClick={() => this.props.calculateAndUpdateReview()}><FontAwesome name="check-circle" /> Save and Submit</Button>
                  </p>
                </Form>
              </CardBlock>
            </Card>
          </Col>
        </Row>
      </PageWrapper>
    );
  }
}

const stateToProps = (state) => {
  return {
    reviews: state.reviews,
    user: state.user,
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadReview,
    setReviewPromptValue,
    updateReview,
    calculateAndUpdateReview,
    setReviewFlagged
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Review);
