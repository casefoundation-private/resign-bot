import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form } from 'reactstrap'
import PageWrapper from '../../PageWrapper'
import PropTypes from 'prop-types'
import GeneralConfigPane from './configPanes/GeneralConfigPane'
import ExternalServicesPane from './configPanes/ExternalServicesPane'
import RestrictionsPane from './configPanes/RestrictionsPane'
import ReviewingPane from './configPanes/ReviewingPane'
import SubmissionsPane from './configPanes/SubmissionsPane'
import {
  setTempConfig,
  loadConfig,
  commitTempConfig,
  addNewTempConfigPrompt,
  addNewTempConfigPromptLabel,
  setTempConfigPromptText,
  setTempConfigPromptLabelText,
  removeTempConfigPrompt,
  removeTempConfigPromptLabel,
  addNewTempConfigCategory,
  addNewTempConfigCategoryLabel,
  setTempConfigCategoryText,
  setTempConfigCategoryLabelText,
  removeTempConfigCategory,
  removeTempConfigCategoryLabel,
  setTempConfigImportPauseStart,
  setTempConfigImportPauseLength,
  removeTempConfigImportPause,
  addNewTempConfigImportPause
} from '../../actions/config'
import './Configuration.css'
import FontAwesome from 'react-fontawesome'

class Configuration extends Component {
  constructor (props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'general'
    }
  }

  componentDidMount () {
    this.props.loadConfig()
  }

  toggle (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }

  saveConfig (event) {
    event.preventDefault()
    this.props.commitTempConfig()
    return false
  }

  render () {
    const ctabs = [
      {
        id: 'general',
        title: 'General',
        render: () => (<GeneralConfigPane tempConfig={this.props.config.tempConfig} setTempConfig={this.props.setTempConfig} />)
      },
      {
        id: 'extservices',
        title: 'Importing & External Services',
        render: () => (
          <ExternalServicesPane
            tempConfig={this.props.config.tempConfig}
            setTempConfig={this.props.setTempConfig}
            setTempConfigImportPauseStart={this.props.setTempConfigImportPauseStart}
            setTempConfigImportPauseLength={this.props.setTempConfigImportPauseLength}
            removeTempConfigImportPause={this.props.removeTempConfigImportPause}
            addNewTempConfigImportPause={this.props.addNewTempConfigImportPause}
          />
        )
      },
      {
        id: 'restrictions',
        title: 'Restrictions',
        render: () => (<RestrictionsPane tempConfig={this.props.config.tempConfig} setTempConfig={this.props.setTempConfig} />)
      },
      {
        id: 'reviewing',
        title: 'Reviewing',
        render: () => (
          <ReviewingPane
            tempConfig={this.props.config.tempConfig}
            setTempConfig={this.props.setTempConfig}
            addNewTempConfigPrompt={this.props.addNewTempConfigPrompt}
            addNewTempConfigPromptLabel={this.props.addNewTempConfigPromptLabel}
            setTempConfigPromptText={this.props.setTempConfigPromptText}
            setTempConfigPromptLabelText={this.props.setTempConfigPromptLabelText}
            removeTempConfigPrompt={this.props.removeTempConfigPrompt}
            removeTempConfigPromptLabel={this.props.removeTempConfigPromptLabel}
            addNewTempConfigCategory={this.props.addNewTempConfigCategory}
            addNewTempConfigCategoryLabel={this.props.addNewTempConfigCategoryLabel}
            setTempConfigCategoryText={this.props.setTempConfigCategoryText}
            setTempConfigCategoryLabelText={this.props.setTempConfigCategoryLabelText}
            removeTempConfigCategory={this.props.removeTempConfigCategory}
            removeTempConfigCategoryLabel={this.props.removeTempConfigCategoryLabel}
          />
        )
      },
      {
        id: 'submissions',
        title: 'Submissions',
        render: () => (<SubmissionsPane tempConfig={this.props.config.tempConfig} setTempConfig={this.props.setTempConfig} />)
      }
    ]
    return (
      <PageWrapper title='Configuration'>
        <Form onSubmit={(e) => this.saveConfig(e)}>
          <Nav tabs>
            {
              ctabs.map(tab => (
                <NavItem key={tab.id}>
                  <NavLink
                    className={this.state.activeTab === tab.id ? 'active' : null}
                    onClick={() => { this.toggle(tab.id) }}
                  >
                    {tab.title}
                  </NavLink>
                </NavItem>
              ))
            }
          </Nav>
          <TabContent activeTab={this.state.activeTab} className='config-tab-panes'>
            {
              ctabs.map(tab => (
                <TabPane tabId={tab.id} key={tab.id}>
                  {tab.render()}
                </TabPane>
              ))
            }
          </TabContent>
          <Button color='primary' type='submit'><FontAwesome name='check-circle-o' /> Save</Button>
        </Form>
      </PageWrapper>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    setTempConfig,
    loadConfig,
    commitTempConfig,
    addNewTempConfigPrompt,
    addNewTempConfigPromptLabel,
    setTempConfigPromptText,
    setTempConfigPromptLabelText,
    removeTempConfigPrompt,
    removeTempConfigPromptLabel,
    addNewTempConfigCategory,
    addNewTempConfigCategoryLabel,
    setTempConfigCategoryText,
    setTempConfigCategoryLabelText,
    removeTempConfigCategory,
    removeTempConfigCategoryLabel,
    setTempConfigImportPauseStart,
    setTempConfigImportPauseLength,
    removeTempConfigImportPause,
    addNewTempConfigImportPause
  }, dispatch)
}

Configuration.propTypes = {
  config: PropTypes.shape({
    tempConfig: PropTypes.object
  }),
  setTempConfig: PropTypes.func.isRequired,
  loadConfig: PropTypes.func.isRequired,
  commitTempConfig: PropTypes.func.isRequired,
  addNewTempConfigPrompt: PropTypes.func.isRequired,
  addNewTempConfigPromptLabel: PropTypes.func.isRequired,
  setTempConfigPromptText: PropTypes.func.isRequired,
  setTempConfigPromptLabelText: PropTypes.func.isRequired,
  removeTempConfigPrompt: PropTypes.func.isRequired,
  removeTempConfigPromptLabel: PropTypes.func.isRequired,
  addNewTempConfigCategory: PropTypes.func.isRequired,
  addNewTempConfigCategoryLabel: PropTypes.func.isRequired,
  setTempConfigCategoryText: PropTypes.func.isRequired,
  setTempConfigCategoryLabelText: PropTypes.func.isRequired,
  removeTempConfigCategory: PropTypes.func.isRequired,
  removeTempConfigCategoryLabel: PropTypes.func.isRequired,
  setTempConfigImportPauseStart: PropTypes.func.isRequired,
  setTempConfigImportPauseLength: PropTypes.func.isRequired,
  removeTempConfigImportPause: PropTypes.func.isRequired,
  addNewTempConfigImportPause: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(Configuration)
