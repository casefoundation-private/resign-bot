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
  getSubmissionFields
} from '../../misc/utils';
import url from 'url';
import getVideoId from 'get-video-id';
import './Review.css';

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

  renderSubmissionField(fieldKey) {
    const fieldValue = this.props.reviews.review.submission.data[fieldKey];
    if (fieldValue) {
      const parsedURL = url.parse(fieldValue);
      const videoId = getVideoId(fieldValue);
      const colon = fieldKey[fieldKey.length - 1] === ':' ? '' : ':';
      if (videoId && videoId.service && videoId.id) {
        let embedURL;
        switch(videoId.service) {
          case 'youtube':
            embedURL = 'https://www.youtube.com/embed/'+videoId.id+'?rel=0';
            break;
          case 'vimeo':
            embedURL = 'https://player.vimeo.com/video/'+videoId.id+'?rel=0';
            break;
          default:
            embedURL = fieldValue;
        }
        return (
          <div key={fieldKey} className="submission-field">
            <strong>{fieldKey}{colon}</strong>
            <br/>
            <div className="embed-responsive embed-responsive-16by9">
              <iframe title="Embedded Video" className="embed-responsive-item" src={embedURL} allowfullscreen></iframe>
            </div>
          </div>
        );
      } else if (parsedURL && (parsedURL.protocol === 'https:' || parsedURL.protocol === 'http:')) {
        return (
          <div key={fieldKey} className="submission-field">
            <strong>{fieldKey}{colon}</strong> <a href={fieldValue} target="_blank">{fieldValue}</a>
          </div>
        );
      } else if (fieldValue.length > 200) {
        return (
          <div key={fieldKey} className="submission-field">
            <strong>{fieldKey}{colon}</strong>
            <br/>
            {fieldValue}
          </div>
        );
      }
      return (
        <div key={fieldKey} className="submission-field">
          <strong>{fieldKey}</strong>{colon} {fieldValue}
        </div>
      );
    }
  }

  renderReviewPrompts() {
    return this.props.reviews.review.data && this.props.reviews.review.data.prompts && this.props.config.review.prompts.map((prompt,i) => {
      return (
        <FormGroup key={i} tag="fieldset">
          <label>
            {prompt}
          </label>
          {
            this.props.config.review.labels.map((label,j) => {
              return (
                <FormGroup check key={j}>
                  <Label check>
                    <Input type="radio" name={'review_prompt_'+i} value={j} checked={this.props.reviews.review.data.prompts[i] === j} onChange={() => this.props.setReviewPromptValue(i,j)} />{' '}
                    {label}
                  </Label>
                </FormGroup>
              );
            })
          }
        </FormGroup>
      )
    });
  }

  render() {
    return (
      <PageWrapper title={'Reviewing ' + (this.props.reviews.review && summarizeSubmission(this.props.reviews.review.submission))}>
        <Row>
          <Col>
            <h2>Submitter Information</h2>
            { this.props.reviews.review && getSubmissionFields(this.props.reviews.review.submission).map((fieldKey) => this.renderSubmissionField(fieldKey)) }
          </Col>
          <Col md={4}>
            <Card>
              <CardBlock>
                <CardTitle>My Review</CardTitle>
                <Form>
                  <p>
                    <FormGroup check>
                      <Label check>
                        <Input type="checkbox" name="review_flagged" value="flagged" checked={this.props.reviews.review && this.props.reviews.review.flagged} onChange={(event) => this.props.setReviewFlagged(event.target.checked)} />{' '}
                        Flag as Inappropriate
                      </Label>
                    </FormGroup>
                  </p>
                  { this.renderReviewPrompts() }
                  <p>
                    <Button color="primary" onClick={() => this.props.updateReview()}>Save</Button>
                    { ' ' }
                    <Button color="warning" onClick={() => this.props.calculateAndUpdateReview()}>Save and Submit</Button>
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
