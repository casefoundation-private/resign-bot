import React, { Component } from 'react'
import { FormGroup, Label, ButtonToolbar, ButtonGroup, Button, FormText } from 'reactstrap'
import PropTypes from 'prop-types'
import {Editor, EditorState, RichUtils, ContentState, convertFromHTML} from 'draft-js'
import FontAwesome from 'react-fontawesome'
import {stateToHTML} from 'draft-js-export-html'
import {ConfigurationField} from '../../../misc/utils'

class GeneralConfigPane extends Component {
  constructor (props) {
    super(props)
    let editorState
    if (props.tempConfig.helpText) {
      const blocksFromHTML = convertFromHTML(props.tempConfig.helpText)
      let content = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      )
      editorState = EditorState.createWithContent(content)
    } else {
      editorState = EditorState.createEmpty()
    }
    this.state = {
      editorState: editorState
    }
    this.onChange = (editorState) => {
      this.props.setTempConfig({helpText: stateToHTML(editorState.getCurrentContent())})
      this.setState({editorState})
    }
  }

  handleKeyCommand (command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  render () {
    return (
      <div>
        <ConfigurationField
          label={'Root URL'}
          name={'urlRoot'}
          type={'text'}
          tempConfig={this.props.tempConfig}
          setTempConfig={this.props.setTempConfig}
          help={'URL root of the site. (ie. https://reviewomatic.com)'}
        />
        <ConfigurationField
          label={'Rows Per Page'}
          name={'perPage'}
          type={'number'}
          tempConfig={this.props.tempConfig}
          setTempConfig={this.props.setTempConfig}
          help={'The number of rows to show on table views like Submissions, Users, etc.'}
        />
        <FormGroup>
          <Label for='helpText'>Help Text</Label>
          <div className='editor-wrapper'>
            <ButtonToolbar>
              <ButtonGroup>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'header-one'))}><FontAwesome name='header' /> Heading</Button>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'header-two'))}><FontAwesome name='header' /> Subhead</Button>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'paragraph'))}><FontAwesome name='paragraph' /> Body</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))}><FontAwesome name='bold' /> Bold</Button>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'))}><FontAwesome name='italic' /> Italics</Button>
                <Button size='sm' color='secondary' onClick={() => this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'))}><FontAwesome name='underline' /> Underline</Button>
              </ButtonGroup>
            </ButtonToolbar>
            <Editor editorState={this.state.editorState} onChange={this.onChange} handleKeyCommand={this.handleKeyCommand} />
          </div>
          <FormText color='muted'>The text displayed on the help page.</FormText>
        </FormGroup>
      </div>
    )
  }
}

GeneralConfigPane.propTypes = {
  tempConfig: PropTypes.object,
  setTempConfig: PropTypes.func.isRequired
}

export default GeneralConfigPane
