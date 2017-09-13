import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row,Col,Card,CardTitle,CardBlock } from 'reactstrap';
import {
  loadReview
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

  renderSubmissionField(fieldKey) {
    const fieldValue = this.props.reviews.review.submission.data[fieldKey];
    if (fieldValue) {
      const parsedURL = url.parse(fieldValue);
      const videoId = getVideoId(fieldValue);
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
            <strong>{fieldKey}:</strong>
            <br/>
            <div className="embed-responsive embed-responsive-16by9">
              <iframe title="Embedded Video" className="embed-responsive-item" src={embedURL} allowfullscreen></iframe>
            </div>
          </div>
        );
      } else if (parsedURL && (parsedURL.protocol === 'https:' || parsedURL.protocol === 'http:')) {
        return (
          <div key={fieldKey} className="submission-field">
            <strong>{fieldKey}:</strong> <a href={fieldValue} target="_blank">{fieldValue}</a>
          </div>
        );
      } else if (fieldValue.length > 200) {
        return (
          <div key={fieldKey} className="submission-field">
            <strong>{fieldKey}:</strong>
            <br/>
            {fieldValue}
          </div>
        );
      }
      return (
        <div key={fieldKey} className="submission-field">
          <strong>{fieldKey}</strong>: {fieldValue}
        </div>
      );
    }
  }

  render() {
    return (
      <PageWrapper title={'Reviewing ' + summarizeSubmission(this.props.reviews.review.submission)}>
        <Row>
          <Col>
            <h2>Submitter's Information</h2>
            { getSubmissionFields(this.props.reviews.review.submission).map((fieldKey) => this.renderSubmissionField(fieldKey)) }
          </Col>
          <Col md={3}>
            <Card>
              <CardBlock>
                <CardTitle>My Review</CardTitle>
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
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadReview
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Review);
