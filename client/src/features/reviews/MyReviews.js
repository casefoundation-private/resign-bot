import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, ButtonGroup, Button } from 'reactstrap'
import {
  loadReviewsForUser,
  recuseReview
} from '../../actions/reviews'
import PageWrapper from '../../PageWrapper'
import {
  summarizeSubmission,
  paginate,
  Spinner
} from '../../misc/utils'
import { Link } from 'react-router-dom'
import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'

class MyReviews extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0
    }
  }

  componentDidMount () {
    this.props.loadReviewsForUser(this.props.user.user.id)
  }

  renderReviewList (reviews) {
    return reviews ? paginate(reviews, this.props.config.perPage, this.state.page,
      (page) => {
        this.setState({page})
      },
      (array) => {
        return (
          <Table striped>
            <thead>
              <tr>
                <th width='30%'>Name</th>
                <th width='30%'>Created</th>
                <th width='40%' className='text-center'>Options</th>
              </tr>
            </thead>
            <tbody>
              {
                array.map((review) => {
                  return (
                    <tr key={review.id}>
                      <td>{summarizeSubmission(review.submission)}</td>
                      <td>{new Date(review.created_at).toLocaleDateString()}</td>
                      <td className='text-center'>
                        <ButtonGroup>
                          { review.score === null && (<Button size='sm' color='danger' onClick={() => this.props.recuseReview(review)}><FontAwesome name='ban' /> Recuse Myself</Button>)}
                          <Link to={'/reviews/' + review.id} className='btn btn-primary btn-sm' disabled={review.score !== null}>
                            { review.score === null
                              ? (<span><FontAwesome name='check-square' />{ ' Review Submission'}</span>)
                              : (<span><FontAwesome name='eye' />{ ' View Submission'}</span>)}
                          </Link>
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        )
      }
    ) : (<Spinner />)
  }

  render () {
    return (
      <PageWrapper title='My Review Queue'>
        { this.renderReviewList(this.props.reviews.reviews && this.props.reviews.reviews.filter((review) => review.score === null)) }
        <h4>Completed Reviews</h4>
        { this.renderReviewList(this.props.reviews.reviews && this.props.reviews.reviews.filter((review) => review.score !== null)) }
      </PageWrapper>
    )
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
    loadReviewsForUser,
    recuseReview
  }, dispatch)
}

MyReviews.propTypes = {
  loadReviewsForUser: PropTypes.func.isRequired,
  recuseReview: PropTypes.func.isRequired,
  user: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.number.isRequired
    })
  }),
  config: PropTypes.shape({
    perPage: PropTypes.number
  }),
  reviews: PropTypes.shape({
    reviews: PropTypes.array
  })
}

export default connect(stateToProps, dispatchToProps)(MyReviews)
