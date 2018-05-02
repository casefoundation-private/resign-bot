import React from 'react'
import { Table } from 'reactstrap'
import PropTypes from 'prop-types'

const ReviewSummary = (props) => {
  return (
    <Table striped>
      <thead>
        <tr>
          <th>Question</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {
          props.prompts.map((prompt, i) => {
            return (
              <tr key={'prompt_' + i}>
                <td>{prompt.prompt}</td>
                <td>{props.review.data.prompts[i] >= 0 ? props.review.data.prompts[i] : 'N/A'}</td>
              </tr>
            )
          })
        }
        {
          props.categories.map((category, i) => {
            return (
              <tr key={'category_' + i}>
                <td>{category.prompt}</td>
                <td>{props.review.data.categories[i] !== null ? props.review.data.categories[i] : 'N/A'}</td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
  )
}

ReviewSummary.propTypes = {
  prompts: PropTypes.array.isRequired,
  review: PropTypes.shape({
    data: PropTypes.shape({
      categories: PropTypes.array.isRequired,
      prompts: PropTypes.array.isRequired
    })
  }),
  categories: PropTypes.array.isRequired
}

export default ReviewSummary
