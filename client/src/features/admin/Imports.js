import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table } from 'reactstrap'
import {
  loadImports,
  importFiles
} from '../../actions/importer'
import PageWrapper from '../../PageWrapper'
import {
  Spinner
} from '../../misc/utils'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import './Imports.css'

class Imports extends Component {
  componentDidMount () {
    this.props.loadImports()
  }

  render () {
    return (
      <PageWrapper title='Imports'>
        <Dropzone className='import-area' onDrop={(files) => this.props.importFiles(files)}>
          <div>Drop a CSV or JSON file here to upload submissions</div>
        </Dropzone>
        <Table striped>
          <thead>
            <tr>
              <th>Type</th>
              <th>Created</th>
              <th>Total</th>
              <th>New</th>
              <th>Duplicates</th>
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.importer.imports ? this.props.importer.imports.map(imp => {
                return (
                  <tr key={imp.id}>
                    <td>{imp.importer}</td>
                    <td>{new Date(imp.created_at).toLocaleString()}</td>
                    <td>{imp.total}</td>
                    <td>{imp.new}</td>
                    <td>{imp.duplicates}</td>
                    <td>{imp.errors}</td>
                  </tr>
                )
              }) : (<Spinner />)
            }
          </tbody>
        </Table>
      </PageWrapper>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    importer: state.importer
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadImports,
    importFiles
  }, dispatch)
}

Imports.propTypes = {
  importer: PropTypes.shape({
    imports: PropTypes.array
  }),
  loadImports: PropTypes.func.isRequired,
  importFiles: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(Imports)
