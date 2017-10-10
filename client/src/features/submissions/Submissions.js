import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row,Col,Form,FormGroup,Label,Input,Table,ButtonGroup,Button,UncontrolledTooltip,Modal,ModalHeader,ModalBody,ModalFooter,InputGroup,InputGroupAddon,InputGroupButton } from 'reactstrap';
import {
  loadSubmissions,
  toggleFlagSubmission,
  togglePinSubmission,
  downloadSubmissions,
  setSubmissionSort,
  setSubmissionSearch,
  clearAutoFlagSubmission
} from '../../actions/submissions';
import {
  makeFavorite,
  deleteFavorite
} from '../../actions/user';
import PageWrapper from '../../PageWrapper';
import {
  summarizeSubmission,
  completedReviews,
  incompletedReviews,
  getFavorite,
  round,
  SubmissionContents,
  actualFlagsForSubmission
} from '../../misc/utils';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import SubmissionReviews from './SubmissionReviews';
import {
  loadImporterPausedState,
  setImporterPaused
} from '../../actions/importer';

//TODO create a setActiveSubmission call for this to sync with sub props

class Submissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    };
  }

  openReviewEditorModel(submission) {
    this.setState({
      reviewEditorModal: true,
      submissionDetailModal: false,
      submission
    });
  }

  closeReviewEditorModel() {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    });
  }

  openSubmissionDetailModal(submission) {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: true,
      submission
    });
  }

  closeSubmissionDetailModal() {
    this.setState({
      reviewEditorModal: false,
      submissionDetailModal: false,
      submission: null
    });
  }

  componentDidMount() {
    this.props.loadSubmissions();
    this.props.loadImporterPausedState();
  }

  changeSort(name) {
    if (this.props.submissions.sort.field === name) {
      this.props.setSubmissionSort(name,this.props.submissions.sort.direction === 'asc' ? 'desc' : 'asc');
    } else {
      this.props.setSubmissionSort(name,'asc');
    }
  }

  generateSortableColumnHeader(label,name) {
    return (
      <span onClick={() => this.changeSort(name)} className="sort-column">
        { label }{' '}
        <FontAwesome name={this.props.submissions.sort.field === name ? ('sort-'+this.props.submissions.sort.direction) : 'sort'} />
      </span>
    )
  }

  getSubmissions() {
    if (this.props.submissions.submissions) {
      if (this.props.submissions.search.indices) {
        return this.props.submissions.submissions.filter((submission,i) => this.props.submissions.search.indices.indexOf(i) >= 0);
      } else {
        return this.props.submissions.submissions;
      }
    }
    return [];
  }

  render() {
    return (
      <div>
        <PageWrapper title={'Submissions (' + (this.props.submissions.submissions && this.props.submissions.submissions.length) + ' Total)'}>
          <Row>
            <Col>
              <Form inline>
                <FormGroup>
                  <Label for="search" hidden>Search String</Label>
                  <InputGroup>
                    <Input onChange={(event) => this.props.setSubmissionSearch(event.target.value.trim().length > 0 ? event.target.value : null)} value={this.props.submissions.search.str || ''} type="text" name="search" id="search" placeholder="Search" />
                    {
                      this.props.submissions.search.str && this.props.submissions.search.str.length > 0 ?
                        (<InputGroupButton><Button color="danger" onClick={() => this.props.setSubmissionSearch(null)}><FontAwesome name="times-circle" /></Button></InputGroupButton>)
                        : (<InputGroupAddon><FontAwesome name="search" /></InputGroupAddon>)
                    }
                  </InputGroup>
                </FormGroup>
              </Form>
            </Col>
            <Col className="text-right">
              <ButtonGroup>
                <Button color={this.props.importer.paused ? 'success' : 'danger'} onClick={() => this.props.setImporterPaused(!this.props.importer.paused)}>
                  {this.props.importer.paused ?
                    (<span><FontAwesome name="play" /> Resume Importing</span>)
                    : (<span><FontAwesome name="pause" /> Pause Importing</span>)}
                </Button>
                <Button color="primary" onClick={() => this.props.downloadSubmissions()}>
                  <FontAwesome name="download" /> Download Submissions
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <br/>
          <Table striped>
            <thead>
              <tr>
                <th>{this.generateSortableColumnHeader('ID','id')}</th>
                <th>{this.generateSortableColumnHeader('Name','summary')}</th>
                <th>{this.generateSortableColumnHeader('Score','score')}</th>
                <th>{this.generateSortableColumnHeader('Std Deviation','deviation')}</th>
                <th>{this.generateSortableColumnHeader('Completed Reviews','completedReviews')}</th>
                <th>{this.generateSortableColumnHeader('Assigned Reviews','assignedReviews')}</th>
                <th>{this.generateSortableColumnHeader('Flags','flags')}</th>
                {
                  this.props.config.review.categories.map((category,i) => {
                    return (
                      <th key={'category_'+i}>
                        {this.generateSortableColumnHeader(category.prompt,'category_'+i)}
                      </th>
                    );
                  })
                }
                <th>{this.generateSortableColumnHeader('Created','created_at')}</th>
                <th className="text-center">
                <FontAwesome name="question-circle" id="favorite-tooltip" />
                  <UncontrolledTooltip placement="bottom" target="favorite-tooltip">
                    This is a marker that only you control. Your favorites are differnet than other users{'\''} favorites so that you can mark the submissions you are most interested in tracking.
                  </UncontrolledTooltip>
                  {' '}
                  {this.generateSortableColumnHeader('Favorite','favorite')}
                </th>
                <th className="text-center">
                  <FontAwesome name="question-circle" id="pinned-tooltip" />
                  <UncontrolledTooltip placement="bottom" target="pinned-tooltip">
                    Pinning a submission is a global change. If you pin a submisison here, it will be pinned for all other users.
                  </UncontrolledTooltip>
                  {' '}
                  {this.generateSortableColumnHeader('Pinned','pinned')}
                </th>
                <th className="text-center">
                  { this.props.config.flaggedByDefault ?
                    (
                      <div>
                        <FontAwesome name="question-circle" id="approved-tooltip" />
                        <UncontrolledTooltip placement="bottom" target="approved-tooltip">
                          Approving a submission is a global change. If you approve a submisison here, it will be approved for all other users.
                        </UncontrolledTooltip>
                        {' '}
                        {this.generateSortableColumnHeader('Approved','flagged')}
                      </div>
                    )
                    : (
                      <div>
                        <FontAwesome name="question-circle" id="flagged-tooltip" />
                        <UncontrolledTooltip placement="bottom" target="flagged-tooltip">
                          Flagging a submission is a global change. If you flag a submisison here, it will be flagged for all other users.
                        </UncontrolledTooltip>
                        {' '}
                        {this.generateSortableColumnHeader('Flagged','flagged')}
                      </div>
                    )
                  }
                </th>
                <th className="text-center">
                  <FontAwesome name="question-circle" id="auto-flagged-tooltip" />
                  <UncontrolledTooltip placement="bottom" target="auto-flagged-tooltip">
                    Auto-flagged submissions are those which the computer flagged as inappropriate. If a submission has been automatically flagged, an admin can remove the flag but not reinstate it. To do that, use the regular "Flagged" field.
                  </UncontrolledTooltip>
                  {' '}
                  {this.generateSortableColumnHeader('Auto Flagged','autoFlagged')}
                </th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                this.getSubmissions().map((submission) => {
                  const favorite = getFavorite(this.props.user.favorites,submission);
                  return (
                    <tr key={submission.id}>
                      <td>{submission.id}</td>
                      <td>{summarizeSubmission(submission)}</td>
                      <td>{submission.score === null ? 'N/A' : round(submission.score)}</td>
                      <td>{submission.deviation === null ? 'N/A' : round(submission.deviation)}</td>
                      <td>{completedReviews(submission).length}</td>
                      <td>{incompletedReviews(submission).length}</td>
                      <td>{actualFlagsForSubmission(this.props.config,submission)}</td>
                      {
                        this.props.config.review.categories.map((category,i) => {
                          return (
                            <td key={'category_'+i}>
                              { submission.categories && submission.categories[category.prompt] ?
                                submission.categories[category.prompt]
                                : 'N/A'}
                            </td>
                          );
                        })
                      }
                      <td>{submission.created_at && submission.created_at.toLocaleDateString ? submission.created_at.toLocaleDateString() : submission.created_at}</td>
                      <td className="text-center">
                        { !favorite ?
                          ( <Button size="sm" color="secondary" onClick={() => this.props.makeFavorite(submission)}><FontAwesome name="star" /></Button> )
                          : ( <Button size="sm" color="success" onClick={() => this.props.deleteFavorite(favorite)}><FontAwesome name="star" /></Button> )
                        }
                      </td>
                      <td className="text-center">
                        <Button size="sm" color={submission.pinned ? 'success' : 'secondary'} onClick={() => this.props.togglePinSubmission(submission)}>
                          <FontAwesome name="circle" />
                        </Button>
                      </td>
                      <td className="text-center">
                        <Button size="sm" color={submission.flagged ? (this.props.config.flaggedByDefault ? 'secondary' : 'danger') : (this.props.config.flaggedByDefault ? 'success' : 'secondary')} onClick={() => this.props.toggleFlagSubmission(submission)}>
                          { this.props.config.flaggedByDefault ?
                            (<FontAwesome name="thumbs-up" />)
                            : (<FontAwesome name="exclamation-triangle" />) }
                        </Button>
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          color={submission.autoFlagged ? 'danger' : 'secondary' }
                          onClick={() => this.props.clearAutoFlagSubmission(submission)}
                          disabled={!submission.autoFlagged}>
                          <FontAwesome name="exclamation-triangle" />
                        </Button>
                      </td>
                      <td className="text-center">
                        <ButtonGroup>
                          <Button onClick={() => this.openSubmissionDetailModal(submission)} color="primary" size="sm"><FontAwesome name="eye" /> View Submission</Button>
                          <Button onClick={() => this.openReviewEditorModel(submission)} color="primary" size="sm"><FontAwesome name="list" /> Manage Reviews</Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </PageWrapper>
        <Modal isOpen={this.state.reviewEditorModal} toggle={() => this.closeReviewEditorModel()} size="lg">
          <ModalHeader toggle={() => this.closeReviewEditorModel()}>Submission Reviews for {summarizeSubmission(this.state.submission)}</ModalHeader>
          <ModalBody>
            <SubmissionReviews submissionId={this.state.submission && this.state.submission.id} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.closeReviewEditorModel()}>Done</Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.submissionDetailModal} toggle={() => this.closeSubmissionDetailModal()} size="lg">
          <ModalHeader toggle={() => this.closeSubmissionDetailModal()}>
            <Link to={'/submissions/'+(this.state.submission && this.state.submission.id)}>
              {summarizeSubmission(this.state.submission)}
            </Link>
          </ModalHeader>
          <ModalBody>
            <SubmissionContents submission={this.state.submission} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.closeSubmissionDetailModal()}>Done</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const stateToProps = (state) => {
  return {
    submissions: state.submissions,
    user: state.user,
    config: state.config,
    importer: state.importer
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadSubmissions,
    toggleFlagSubmission,
    togglePinSubmission,
    makeFavorite,
    deleteFavorite,
    downloadSubmissions,
    setSubmissionSort,
    setSubmissionSearch,
    loadImporterPausedState,
    setImporterPaused,
    clearAutoFlagSubmission
  }, dispatch);
}

export default connect(stateToProps, dispatchToProps)(Submissions);
