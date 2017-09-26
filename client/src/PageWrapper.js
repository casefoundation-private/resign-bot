import React, { Component } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Form, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  clearMessage
} from './actions/message';
import FontAwesome from 'react-fontawesome';

class PageWrapper extends Component {
  clearAlert() {
    this.props.clearMessage();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.message.message !== nextProps.message.message) {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.clearAlert();
      },5000);
    }
  }

  render() {
    return (
      <div>
        <Navbar color="inverse" inverse toggleable>
          <NavbarBrand href="#/">Review-O-Matic</NavbarBrand>
          <Nav className="ml-auto" navbar>
            { this.props.user.user && this.props.user.user.role === 'admin' && (
                <NavItem>
                  <Link to="/users" className="nav-link">Users</Link>
                </NavItem>
            ) }
            { this.props.user.user && this.props.user.user.role === 'admin' && (
                <NavItem>
                  <Link to="/submissions" className="nav-link">Submissions</Link>
                </NavItem>
            ) }
            { this.props.user.user && this.props.user.user.role === 'admin' && (
                <NavItem>
                  <Link to="/notifications" className="nav-link">Notification Queue</Link>
                </NavItem>
            ) }
            { this.props.user.user && (
                <NavItem>
                  <Link to="/reviews" className="nav-link">My Review Queue</Link>
                </NavItem>
            ) }
            { this.props.user.user && (
                <NavItem>
                  <Link to={'/users/'+this.props.user.user.id} className="nav-link">My Account</Link>
                </NavItem>
            ) }
            { this.props.user.user && this.props.config.helpText && (
                <NavItem>
                  <Link to={'/help'} className="nav-link">Help</Link>
                </NavItem>
            ) }
          </Nav>
          <Form className="form-inline">
            <Link to="/logout" className="btn btn-danger"><FontAwesome name="sign-out" /> Logout</Link>
          </Form>
        </Navbar>
        <div className="container-fluid" style={{paddingTop: 12}} role="main">
          { this.props.title && (<h1 className="page-header">{this.props.title}</h1>) }
          { this.props.message.message ? <div className="fixed-alert-wrapper"><Alert color={this.props.message.messageType} toggle={() => this.clearAlert()}>{this.props.message.message}</Alert></div> : null }
          { this.props.children }
        </div>
      </div>
    );
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
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(PageWrapper);
