import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row,Col,Card,CardTitle,CardBlock,Form,Button,Label,Input,FormGroup,Badge } from 'reactstrap';
import {
  loadReview,
  setReviewPromptValue,
  updateReview,
  calculateAndUpdateReview,
  setReviewFlagged,
  validateReview
} from '../../actions/reviews';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  SubmissionContents
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import ReviewSummary from '../submissions/ReviewSummary';

class Review extends Component {
  componentDidMount() {
    const reviewId = parseInt(this.props.match.params.reviewId,10);
    this.props.loadReview(reviewId);
  }

  updateReviewRank(prompt,strValue) {
    const intValue = parseInt(strValue,10);
    if (intValue >= 0) {
      this.props.setReviewPromptValue(prompt,intValue);
    } else {
      this.props.setReviewPromptValue(prompt,null);
    }
  }

  renderReviewPrompts() {
    return this.props.reviews.review.data && this.props.reviews.review.data.prompts && this.props.config.review.prompts.map((prompt,i) => {
      return (
        <FormGroup key={i}>
          <Label for={'review_prompt_'+i}>
            <strong>{prompt.prompt}</strong>
          </Label>
          <Input disabled={this.freezeFields()} type="select" value={this.props.reviews.review.data.prompts[i] >= 0 ? this.props.reviews.review.data.prompts[i] : ''} onChange={(event) => this.updateReviewRank(i,event.target.value)}>
            <option value="none">Select One</option>
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

  renderReviewSummary() {
    if (this.props.reviews.review) {
      if (this.props.reviews.review.flagged) {
        return (<Badge color="danger">Review flagged as inappropriate</Badge>);
      } else {
        return (<ReviewSummary review={this.props.reviews.review} prompts={this.props.config.review.prompts} />);
      }
    }
    return null;
  }

  freezeFields() {
    return this.props.reviews.review && this.props.reviews.review.score !== null;
  }

  save() {
    this.props.updateReview();
  }

  saveAndSubmit() {
    this.props.calculateAndUpdateReview();
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
                {
                  this.props.reviews.review && this.props.reviews.review.score === null ?
                    (
                      <Form>
                        <div>
                          <FormGroup check>
                            <Label check>
                              <Input disabled={this.freezeFields()} type="checkbox" name="review_flagged" value="flagged" checked={this.props.reviews.review && this.props.reviews.review.flagged} onChange={(event) => this.props.setReviewFlagged(event.target.checked)} />{' '}
                              <strong>Flag as Inappropriate</strong>
                            </Label>
                          </FormGroup>
                        </div>
                        { this.renderReviewPrompts() }
                        <p>
                          <Button disabled={this.freezeFields()} color="primary" onClick={() => this.save()}><FontAwesome name="check-circle-o" /> Save</Button>
                          { ' ' }
                          <Button disabled={this.freezeFields() || !this.props.reviews.reviewIsValid} color="warning" onClick={() => this.saveAndSubmit()}><FontAwesome name="check-circle" /> Save and Submit</Button>
                        </p>
                      </Form>
                    )
                    :
                    this.renderReviewSummary()
                }
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
    setReviewFlagged,
    validateReview
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Review);
