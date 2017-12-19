import url from 'url'
import getVideoId from 'get-video-id'
import React from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import FontAwesome from 'react-fontawesome'
import './utils.css'
import PropTypes from 'prop-types'

const _ = require('lodash')
const summaryCache = {}

export const summarizeSubmission = (submission) => {
  if (!submission || !submission.data) {
    return null
  } else if (!summaryCache[submission.id] && submission.data['First Name'] && submission.data['Last Name']) {
    summaryCache[submission.id] = (submission.data['First Name'] + ' ' + submission.data['Last Name'])
  } else if (!summaryCache[submission.id]) {
    summaryCache[submission.id] = (submission.source + '/' + submission.external_id)
  }
  return summaryCache[submission.id]
}

export const pinnedSubmissions = (submissions) => {
  return submissions.filter((submission) => submission.pinned === true)
}

export const completedReviews = (submission) => {
  return submission.reviews.filter((review) => review.score !== null)
}

export const incompletedReviews = (submission) => {
  return submission.reviews.filter((review) => review.score === null)
}

export const getSubmissionFields = (submission) => {
  return submission && submission.data ? _.keys(submission.data) : []
}

export const getFavorite = (favorites, submission) => {
  return favorites && favorites.find((_submission) => _submission.id === submission.id)
}

export const round = (n) => {
  return (Math.round(n * 100) / 100)
}

export const actualFlagsForSubmission = (config, submission) => {
  let total = null
  if (submission.flags !== null) {
    total = submission.flags
  }
  if (submission.flagged === true && total === null) {
    total = 1
  } else if (submission.flagged === true) {
    total++
  }
  if (submission.autoFlagged === true && total === null) {
    total = 1
  } else if (submission.autoFlagged === true) {
    total++
  }
  return total === null ? 'N/A' : total
}

export const paginate = (array, perPage, page, goToPageCallback, renderCallback) => {
  if (perPage > 0) {
    const nPages = Math.ceil(array.length / perPage)
    if (page < nPages) {
      const startIndex = page * perPage
      const endIndex = Math.min(array.length, startIndex + perPage)
      const pageNums = []
      for (var i = 0; i < nPages; i++) {
        pageNums.push(i)
      }
      return (
        <div>
          { renderCallback(array.slice(startIndex, endIndex)) }
          <div className='text-center'>
            <ButtonGroup>
              <Button onClick={() => goToPageCallback(page - 1)} disabled={page === 0}>
                <FontAwesome name='chevron-left' />
              </Button>
              {
                pageNums.map((pageNum) => {
                  return (
                    <Button key={pageNum} onClick={() => goToPageCallback(pageNum)} className={pageNum === page ? 'active' : null}>
                      {pageNum + 1}
                    </Button>
                  )
                })
              }
              <Button onClick={() => goToPageCallback(page + 1)} disabled={page + 1 >= nPages}>
                <FontAwesome name='chevron-right' />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      )
    } else if (nPages > 0) {
      return paginate(array, perPage, 0, goToPageCallback, renderCallback)
    } else {
      return null
    }
  } else {
    return renderCallback(array)
  }
}

export const SubmissionContents = (props) => {
  return (
    <div>
      {props.submission && getSubmissionFields(props.submission).map((fieldKey) => {
        const fieldValue = props.submission.data[fieldKey]
        if (fieldValue) {
          const parsedURL = url.parse(fieldValue)
          const videoId = getVideoId(fieldValue)
          const colon = fieldKey[fieldKey.length - 1] === ':' ? '' : ':'
          if (videoId && videoId.service && videoId.id) {
            let embedURL
            switch (videoId.service) {
              case 'youtube':
                embedURL = 'https://www.youtube.com/embed/' + videoId.id + '?rel=0'
                break
              case 'vimeo':
                embedURL = 'https://player.vimeo.com/video/' + videoId.id + '?rel=0'
                break
              default:
                embedURL = fieldValue
            }
            return (
              <div key={fieldKey} className='submission-field'>
                <strong>{fieldKey}{colon}</strong>
                <br />
                <div className='embed-responsive embed-responsive-16by9'>
                  <iframe title='Embedded Video' className='embed-responsive-item' src={embedURL} allowFullScreen />
                </div>
              </div>
            )
          } else if (parsedURL && (parsedURL.protocol === 'https:' || parsedURL.protocol === 'http:')) {
            return (
              <div key={fieldKey} className='submission-field'>
                <strong>{fieldKey}{colon}</strong> <a href={fieldValue} target='_blank'>{fieldValue}</a>
              </div>
            )
          } else if (fieldValue.length > 200) {
            return (
              <div key={fieldKey} className='submission-field'>
                <strong>{fieldKey}{colon}</strong>
                <br />
                {fieldValue}
              </div>
            )
          }
          return (
            <div key={fieldKey} className='submission-field'>
              <strong>{fieldKey}</strong>{colon} {fieldValue}
            </div>
          )
        } else {
          return null
        }
      })}
    </div>
  )
}

SubmissionContents.propTypes = {
  submission: PropTypes.object
}

export const Spinner = (props) => {
  return (
    <div className='sk-fading-circle'>
      <div className='sk-circle1 sk-circle' />
      <div className='sk-circle2 sk-circle' />
      <div className='sk-circle3 sk-circle' />
      <div className='sk-circle4 sk-circle' />
      <div className='sk-circle5 sk-circle' />
      <div className='sk-circle6 sk-circle' />
      <div className='sk-circle7 sk-circle' />
      <div className='sk-circle8 sk-circle' />
      <div className='sk-circle9 sk-circle' />
      <div className='sk-circle10 sk-circle' />
      <div className='sk-circle11 sk-circle' />
      <div className='sk-circle12 sk-circle' />
    </div>
  )
}
