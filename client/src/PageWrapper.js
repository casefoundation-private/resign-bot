import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, Form, Alert } from 'reactstrap'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  clearMessage
} from './actions/message'
import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'

class PageWrapper extends Component {
  clearAlert () {
    this.props.clearMessage()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.message.message !== nextProps.message.message) {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.clearAlert()
      }, 5000)
    }
  }

  navLink (path, label) {
    return (<Link to={path} className={['nav-link', (window.location.hash.substring(1).indexOf(path) === 0 ? 'active' : '')].join(' ')}>{label}</Link>)
  }

  render () {
    return (
      <div>
        <Navbar color='inverse' inverse toggleable>
          <NavbarBrand href='#/'>Review-O-Matic</NavbarBrand>
          <Nav className='ml-auto' navbar>
            { this.props.user.user && this.props.user.user.role === 'admin' && (
              <NavItem>
                { this.navLink('/users', 'Users') }
              </NavItem>
            ) }
            { this.props.user.user && this.props.user.user.role === 'admin' && (
              <NavItem>
                { this.navLink('/submissions', 'Submissions') }
              </NavItem>
            ) }
            { this.props.user.user && this.props.user.user.role === 'admin' && (
              <NavItem>
                { this.navLink('/notifications', 'Notification Queue') }
              </NavItem>
            ) }
            { this.props.user.user && (
              <NavItem>
                { this.navLink('/reviews', 'My Review Queue') }
              </NavItem>
            ) }
            { this.props.user.user && (
              <NavItem>
                { this.navLink('/users/' + this.props.user.user.id, 'My Account') }
              </NavItem>
            ) }
            { this.props.user.user && this.props.config.helpText && (
              <NavItem>
                { this.navLink('/help', 'Help') }
              </NavItem>
            ) }
          </Nav>
          <Form className='form-inline'>
            <Link to='/logout' className='btn btn-danger'><FontAwesome name='sign-out' /> Logout</Link>
          </Form>
        </Navbar>
        <div className='container-fluid' style={{paddingTop: 12}} role='main'>
          { this.props.title && (<h1 className='page-header'>{this.props.title}</h1>) }
          { this.props.message.message ? <div className='fixed-alert-wrapper'><Alert color={this.props.message.messageType} toggle={() => this.clearAlert()}>{this.props.message.message}</Alert></div> : null }
          { this.props.children }
        </div>
      </div>
    )
  }
}

const stateToProps = (state) => {
  return {
    user: state.user,
    message: state.message,
    config: state.config
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    clearMessage
  }, dispatch)
}

PageWrapper.propTypes = {
  clearMessage: PropTypes.func.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string,
    messageType: PropTypes.string
  }),
  user: PropTypes.shape({
    user: PropTypes.shape({
      role: PropTypes.string,
      id: PropTypes.number
    })
  }),
  config: PropTypes.shape({
    helpText: PropTypes.string
  }),
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
}

export default connect(stateToProps, dispatchToProps)(PageWrapper)
