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
  validateReview,
  setReviewCategoryValue
} from '../../actions/reviews';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  SubmissionContents,
  Spinner
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import ReviewSummary from '../submissions/ReviewSummary';

class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'showValidation': false
    };
  }

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

  updateReviewCateory(category,value) {
    if (value.trim().length >= 0) {
      this.props.setReviewCategoryValue(category,value);
    } else {
      this.props.setReviewCategoryValue(category,null);
    }
  }

  renderReviewPrompts() {
    return (
      <div>
        {
          this.props.reviews.review.data && this.props.reviews.review.data.prompts ? this.props.config.review.prompts.map((prompt,i) => {
            return (
              <FormGroup key={'prompt_'+i} className={this.state.showValidation && this.props.reviews.validation.invalidPrompts.indexOf(i) >= 0 ? 'has-danger' : null}>
                <Label for={'review_prompt_'+i}>
                  <strong>{prompt.prompt}</strong>
                </Label>
                <Input
                  disabled={this.freezeFields()}
                  type="select"
                  value={this.props.reviews.review.data.prompts[i] >= 0 ? this.props.reviews.review.data.prompts[i] : 'none'}
                  onChange={(event) => this.updateReviewRank(i,event.target.value)}>
                  <option value="none">Select One</option>
                  {
                    prompt.labels.map((label,j) => {
                      return (<option value={j} key={j}>{j}: {label}</option>)
                    })
                  }
                </Input>
              </FormGroup>
            )
          }) : (<Spinner />)
        }
        {
          this.props.reviews.review.data && this.props.reviews.review.data.categories ? this.props.config.review.categories.map((category,i) => {
            return (
              <FormGroup key={'category_'+i} className={this.state.showValidation && this.props.reviews.validation.invalidCategories.indexOf(i) >= 0 ? 'has-danger' : null}>
                <Label for={'review_category_'+i}>
                  <strong>{category.prompt}</strong>
                </Label>
                <Input
                  disabled={this.freezeFields()}
                  type="select"
                  value={this.props.reviews.review.data.categories[i] !== null ? this.props.reviews.review.data.categories[i] : 'none'}
                  onChange={(event) => this.updateReviewCateory(i,event.target.value)}>
                  <option value="none">Select One</option>
                  {
                    category.labels.map((label,j) => {
                      return (<option value={label} key={j}>{label}</option>)
                    })
                  }
                </Input>
              </FormGroup>
            )
          }) : (<Spinner />)
        }
      </div>
    );
  }

  renderReviewSummary() {
    if (this.props.reviews.review) {
      if (this.props.reviews.review.flagged) {
        return (<Badge color="danger">Review flagged as inappropriate</Badge>);
      } else {
        return (<ReviewSummary review={this.props.reviews.review} prompts={this.props.config.review.prompts} categories={this.props.config.review.categories} />);
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
    if (this.props.reviews.validation.isValid) {
      this.props.calculateAndUpdateReview();
    } else {
      this.setState({
        'showValidation': true
      });
    }
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
                          <Button disabled={this.freezeFields()} color="warning" onClick={() => this.saveAndSubmit()}><FontAwesome name="check-circle" /> Save and Submit</Button>
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
    validateReview,
    setReviewCategoryValue
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Review);
