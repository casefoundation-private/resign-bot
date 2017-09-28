import React from 'react';
import { Table } from 'reactstrap';

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
          props.prompts.map((prompt,i) => {
            return (
              <tr key={i}>
                <td>{prompt.prompt}</td>
                <td>{props.review.data.prompts[i] >= 0 ? props.review.data.prompts[i] : 'N/A'}</td>
              </tr>
            );
          })
        }
      </tbody>
    </Table>
  );
}

export default ReviewSummary;
