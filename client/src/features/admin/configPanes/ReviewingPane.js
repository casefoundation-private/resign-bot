import React from 'react'
import PropTypes from 'prop-types'
import {ConfigurationField} from '../../../misc/utils'
import { Table, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, FormText } from 'reactstrap'
import FontAwesome from 'react-fontawesome'

const ReviewingPane = (props) => {
  return (
    <div>
      <fieldset className='config-fieldset'>
        <legend>Assigning Reviews</legend>
        <ConfigurationField
          label={'Reviews Per Submission'}
          name={'reviewsPerSubmission'}
          type={'number'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={(<span>Per each new submission created, specify the number of reviews to assign. Cannot be greater than <em>Max Reviews Per Submission</em>.</span>)}
        />
      </fieldset>
      <fieldset className='config-fieldset'>
        <legend>Review Prompts</legend>
        <Table bordered>
          <thead>
            <tr>
              <th width='45%'>Prompt</th>
              <th width='45%'>Options</th>
              <th width='10%' />
            </tr>
          </thead>
          <tbody>
            {
              (props.tempConfig.review.prompts || []).map((prompt, i) => (
                <tr key={i}>
                  <td>
                    <FormGroup>
                      <Label for={'prompt_' + i} className='sr-only'>Prompt</Label>
                      <Input type='text' name={'prompt_' + i} id={'prompt_' + i} value={prompt.prompt || ''} onChange={(event) => props.setTempConfigPromptText(i, event.target.value)} />
                    </FormGroup>
                  </td>
                  <td>
                    {
                      (prompt.labels || []).map((label, j) => (
                        <FormGroup key={j}>
                          <Label for={'prompt_' + i + '_label_' + j} className='sr-only'>Prompt</Label>
                          <InputGroup>
                            <InputGroupAddon>{j} points</InputGroupAddon>
                            <Input type='text' name={'prompt_' + i + '_label_' + j} id={'prompt_' + i + '_label_' + j} value={label || ''} onChange={(event) => props.setTempConfigPromptLabelText(i, j, event.target.value)} />
                            <InputGroupAddon>
                              <Button color='danger' size='sm' onClick={() => props.removeTempConfigPromptLabel(i, j)}><FontAwesome name='trash' /> Remove Label</Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormGroup>
                      ))
                    }
                    <Button color='success' size='sm' onClick={() => props.addNewTempConfigPromptLabel(i)}><FontAwesome name='plus' /> Add Label</Button>
                  </td>
                  <td className='text-center'>
                    <Button color='danger' size='sm' onClick={() => props.removeTempConfigPrompt(i)}><FontAwesome name='trash' /> Remove Prompt</Button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <Button color='success' size='sm' onClick={() => props.addNewTempConfigPrompt()}><FontAwesome name='plus' /> Add Prompt</Button>
        <FormText color='muted'>This controls the scoring dropdowns that appear next to each submission in the <em>My Review Queue</em> section.</FormText>
      </fieldset>
      <fieldset className='config-fieldset'>
        <legend>Review Categories</legend>
        <Table bordered>
          <thead>
            <tr>
              <th width='45%'>Prompt</th>
              <th width='45%'>Options</th>
              <th width='10%' />
            </tr>
          </thead>
          <tbody>
            {
              (props.tempConfig.review.categories || []).map((category, i) => (
                <tr key={i}>
                  <td>
                    <FormGroup>
                      <Label for={'category_' + i} className='sr-only'>Prompt</Label>
                      <Input type='text' name={'category_' + i} id={'category_' + i} value={category.prompt || ''} onChange={(event) => props.setTempConfigCategoryText(i, event.target.value)} />
                    </FormGroup>
                  </td>
                  <td>
                    {
                      (category.labels || []).map((label, j) => (
                        <FormGroup key={j}>
                          <Label for={'category_' + i + '_label_' + j} className='sr-only'>Prompt</Label>
                          <InputGroup>
                            <Input type='text' name={'category_' + i + '_label_' + j} id={'category_' + i + '_label_' + j} value={label || ''} onChange={(event) => props.setTempConfigCategoryLabelText(i, j, event.target.value)} />
                            <InputGroupAddon>
                              <Button color='danger' size='sm' onClick={() => props.removeTempConfigCategoryLabel(i, j)}><FontAwesome name='trash' /> Remove Label</Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormGroup>
                      ))
                    }
                    <Button color='success' size='sm' onClick={() => props.addNewTempConfigCategoryLabel(i)}><FontAwesome name='plus' /> Add Label</Button>
                  </td>
                  <td className='text-center'>
                    <Button color='danger' size='sm' onClick={() => props.removeTempConfigCategory(i)}><FontAwesome name='trash' /> Remove Category</Button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <Button color='success' size='sm' onClick={() => props.addNewTempConfigCategory()}><FontAwesome name='plus' /> Add Category</Button>
        <FormText color='muted'>This controls the categorization dropdowns that appear next to each submission in the <em>My Review Queue</em> section.</FormText>
      </fieldset>
    </div>
  )
}

ReviewingPane.propTypes = {
  tempConfig: PropTypes.object,
  setTempConfig: PropTypes.func.isRequired,
  addNewTempConfigPrompt: PropTypes.func.isRequired,
  addNewTempConfigCategory: PropTypes.func.isRequired
}

export default ReviewingPane
