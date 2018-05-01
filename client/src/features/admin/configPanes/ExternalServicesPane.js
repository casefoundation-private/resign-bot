import React from 'react'
import {ConfigurationField} from '../../../misc/utils'
import PropTypes from 'prop-types'
import { Button, Table, FormGroup, Label, Input, FormText } from 'reactstrap'
import FontAwesome from 'react-fontawesome'

const ExternalServicesPane = (props) => {
  return (
    <div>
      <fieldset className='config-fieldset'>
        <legend>Automated Importing</legend>
        <ConfigurationField
          label={'Suspend Automated Importing'}
          name={'suspendImporting'}
          type={'checkbox'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={'Disable the automated, recurring importing of submissions from external services.'}
        />
        <ConfigurationField
          label={'Import Interval'}
          name={'importInterval'}
          type={'number'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          transformIn={(val) => val / 1000 / 60}
          transformOut={(val) => val * 1000 * 60}
          help={'Time interval in minutes in which to run an import'}
        />
        <FormGroup>
          <Label>Import Pause Schedule</Label>
          <Table bordered>
            <thead>
              <tr>
                <th width='45%'>Import Pause Start</th>
                <th width='45%'>Import Pause Length</th>
                <th width='10%' />
              </tr>
            </thead>
            <tbody>
              {
                (props.tempConfig.importPauses || []).map((pause, i) => (
                  <tr>
                    <td>
                      <FormGroup>
                        <Label className='sr-only' for={'import_pause_start_' + i}>Import Pause Start {i}</Label>
                        <Input type='text' name={'import_pause_start_' + i} id={'import_pause_start_' + i} value={pause.start || ''} onChange={(event) => props.setTempConfigImportPauseStart(i, event.target.value)} />
                        <FormText color='muted'>When a pause should start using Cronjob syntax "* * * * *".</FormText>
                      </FormGroup>
                    </td>
                    <td>
                      <FormGroup>
                        <Label className='sr-only' for={'import_pause_length_' + i}>Import Pause Length {i} (Minutes)</Label>
                        <Input type='number' name={'import_pause_length_' + i} id={'import_pause_length_' + i} value={pause.length ? (pause.length / 1000 / 60) : ''} onChange={(event) => props.setTempConfigImportPauseLength(i, event.target.value.trim().length > 0 ? (parseInt(event.target.value) * 1000 * 60) : '')} />
                        <FormText color='muted'>How long the pause should last in minutes.</FormText>
                      </FormGroup>
                    </td>
                    <td className='text-center'>
                      <Button color='danger' size='sm' onClick={() => props.removeTempConfigImportPause(i)}><FontAwesome name='trash' /> Remove Pause</Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
          <Button color='success' size='sm' onClick={() => props.addNewTempConfigImportPause()}><FontAwesome name='plus' /> Add Scheduled Import Pause</Button>
          <FormText color='muted'>Pause automated importing on a regular schedule.</FormText>
        </FormGroup>
      </fieldset>
      <fieldset className='config-fieldset'>
        <legend>Wufoo</legend>
        <ConfigurationField
          label={'Wufoo API Key'}
          name={'wufooApiKey'}
          type={'string'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={(<span>Available by going to the <em>Forms</em> page, then selecting <em>More</em> > <em>API Information</em> on a form row, and then copying the code next to <em>API Key</em>.</span>)}
        />
        <ConfigurationField
          label={'Wufoo Form ID'}
          name={'wufooFormId'}
          type={'string'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={(<span>Available by going to the <em>Forms</em> page, then selecting <em>More</em> > <em>API Information</em> on a form row, and then copying the code next to <em>Hash</em>.</span>)}
        />
        <ConfigurationField
          label={'Wufoo Subdomain'}
          name={'wufooSubdomain'}
          type={'string'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={(<span>Available by going to the <em>Account</em> > <em>My Account</em> page, then copying red text between <em>https://</em> and <em>.wufoo.com</em>.</span>)}
        />
        <ConfigurationField
          label={'Wufoo Handshake Key'}
          name={'wufooHandshakeKey'}
          type={'string'}
          tempConfig={props.tempConfig}
          setTempConfig={props.setTempConfig}
          help={''}
        />
      </fieldset>
    </div>
  )
}

ExternalServicesPane.propTypes = {
  tempConfig: PropTypes.object,
  setTempConfig: PropTypes.func.isRequired,
  addNewTempConfigImportPause: PropTypes.func.isRequired
}

export default ExternalServicesPane
