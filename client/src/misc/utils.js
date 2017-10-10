import url from 'url';
import getVideoId from 'get-video-id';
import React from 'react';
const _ = require('lodash');
const summaryCache = {};

export const summarizeSubmission = (submission) => {
  if (!submission || !submission.data) {
    return null;
  } else if (summaryCache[submission.id]) {
    return summaryCache[submission.id];
  } else if (submission.data['First Name'] && submission.data['Last Name']) {
    return summaryCache[submission.id] = (submission.data['First Name'] +' '+ submission.data['Last Name']);
  } else {
    return summaryCache[submission.id] = (submission.source + '/' + submission.external_id);
  }
}

export const completedReviews = (submission) => {
  return submission.reviews.filter((review) => review.score !== null);
}

export const incompletedReviews = (submission) => {
  return submission.reviews.filter((review) => review.score === null);
}

export const getSubmissionFields = (submission) => {
  return submission && submission.data ? _.keys(submission.data) : [];
}

export const getFavorite = (favorites,submission) => {
  return favorites && favorites.find((_submission) => _submission.id === submission.id);
}

export const round = (n) => {
  return (Math.round(n * 100) / 100);
}

export const actualFlagsForSubmission = (config,submission) => {
  let total = null;
  if (submission.flags !== null) {
    total = submission.flags;
  }
  if (!config.flaggedByDefault) {
    if (submission.flagged === true && total === null) {
      total = 1;
    } else if (submission.flagged === true) {
      total++;
    }
  }
  if (submission.autoFlagged === true && total === null) {
    total = 1;
  } else if (submission.autoFlagged === true) {
    total++;
  }
  return total === null ? 'N/A' : total;
}

export const SubmissionContents = (props) => {
  return (
    <div>
      {props.submission && getSubmissionFields(props.submission).map((fieldKey) => {
        const fieldValue = props.submission.data[fieldKey];
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
        } else {
          return null;
        }
      })}
    </div>
  );
}
