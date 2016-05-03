import React, { Component, PropTypes } from 'react';
import fecha from 'fecha';

import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Footer from 'grommet/components/Footer';
import Heading from 'grommet/components/Heading';
import Label from 'grommet/components/Label';
import Section from 'grommet/components/Section';
import Tile from 'grommet/components/Tile';
import Tiles from 'grommet/components/Tiles';

import EditIcon from 'grommet/components/icons/base/Edit';
import CloseIcon from 'grommet/components/icons/base/Close';
import DeleteIcon from 'grommet/components/icons/base/Trash';
import StatusIcon from 'grommet/components/icons/Status';
import SpinningIcon from 'grommet/components/icons/Spinning';

import ManageHeader from './Header';
import ManageDeletePost from './ManageDeletePost';
import ManageCancelChangePost from './ManageCancelChangePost';

import Error from '../Error';
import Loading from '../Loading';
import BlogFooter from '../Footer';
import store from '../../store';
import history from '../../RouteHistory';

import { setDocumentTitle } from '../../utils/blog';

export default class Manage extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getArchive('/manage');
  }

  constructor () {
    super();

    this._onArchiveReceived = this._onArchiveReceived.bind(this);
    this._onArchiveFailed = this._onArchiveFailed.bind(this);
    this._renderArchive = this._renderArchive.bind(this);
    this._onRequestToDeletePost = this._onRequestToDeletePost.bind(this);
    this._onDeletePost = this._onDeletePost.bind(this);
    this._onDeletePostCancel = this._onDeletePostCancel.bind(this);
    this._onCancelChangeCancel = this._onCancelChangeCancel.bind(this);
    this._onDeleteSucceed = this._onDeleteSucceed.bind(this);
    this._onCancelChangeSucceed = this._onCancelChangeSucceed.bind(this);
    this._onDeleteFailed = this._onDeleteFailed.bind(this);
    this._onCancelChangeFailed = this._onCancelChangeFailed.bind(this);
    this._onCancelChange = this._onCancelChange.bind(this);
    this._onRequestToCancelChange = this._onRequestToCancelChange.bind(this);

    this.state = {
      archive: undefined,
      loading: true,
      delete: false,
      deleting: false,
      post: undefined
    };
  }

  componentDidMount () {
    setDocumentTitle('Manage');
    store.getArchive('/manage').then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  componentWillReceiveProps () {
    store.getArchive('/manage').then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  _onArchiveReceived (archive) {
    if (archive && Object.keys(archive).length === 0) {
      archive = undefined;
    }
    this.setState({
      archive: archive,
      loading: false,
      deleting: false,
      canceling: false,
      post: undefined,
      error: undefined
    });
  }

  _onArchiveFailed () {
    this.setState({
      archive: undefined,
      loading: false,
      error: 'Could not load posts. Make sure you have internet connection and try again.'
    });
  }

  _onEditPost (postId, event) {
    event.preventDefault();
    history.push(`/manage/post/edit/${postId}`);
  }

  _onDeletePost () {
    this.setState({deleting: true, delete: false});
    store.deletePost(this.state.post).then(
      this._onDeleteSucceed, this._onDeleteFailed
    );
  }

  _onRequestToDeletePost (post, event) {
    event.preventDefault();
    this.setState({delete: true, post: post});
  }

  _onRequestToCancelChange (post, event) {
    event.preventDefault();
    this.setState({cancelChange: true, post: post});
  }

  _onDeletePostCancel () {
    this.setState({delete: false, post: undefined});
  }

  _onCancelChangeCancel () {
    this.setState({cancelChange: false, post: undefined});
  }

  _onDeleteSucceed () {
    store.getArchive('/manage').then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  _onDeleteFailed () {
    this.setState({
      loading: false,
      deleting: false,
      error: 'Could not delete post. Make sure you have internet connection and try again.'
    });
  }

  _onCancelChange () {
    this.setState({canceling: true, cancelChange: false});
    store.cancelChange(this.state.post).then(
      this._onCancelChangeSucceed, this._onCancelChangeFailed
    );
  }

  _onCancelChangeSucceed () {
    //giving some time for the github api to reflect the changes.
    setTimeout(() => {
      store.getArchive('/manage').then(
        this._onArchiveReceived, this._onArchiveFailed
      );
    }, 2000);
  }

  _onCancelChangeFailed () {
    this.setState({
      loading: false,
      canceling: false,
      error: 'Could not cancel change. Make sure you have internet connection and try again.'
    });
  }

  _renderArchive () {
    let monthKeys = Object.keys(this.archive);
    return monthKeys.map((monthLabel, index) => {
      const postsByMonth = this.archive[monthLabel];
      let posts = postsByMonth.map((post, index) => {
        let formattedDate = fecha.format(
          new Date(post.createdAt), 'MMMM D, YYYY'
        );

        const editIcon = <EditIcon a11yTitle={`Edit ${post.title} post`} />;

        let footerNode;
        if (this.state.deleting && this.state.post.id === post.id) {
          footerNode = (
            <Box direction="row" responsive={false}>
              <Box justify="center">
                <SpinningIcon />
              </Box>
              <Box pad={{ horizontal: 'small' }}>
                <span>Deleting...</span>
              </Box>
            </Box>
          );
        } else {
          const deleteIcon = <DeleteIcon a11yTitle={`Delete ${post.title} post`} />;
          footerNode = (
            <Box direction="row" responsive={false}>
              <Anchor href={`/manage/post/edit/${post.id}`} icon={editIcon}
                onClick={this._onEditPost.bind(this, post.id)} />
              <Anchor href="#" icon={deleteIcon}
                onClick={this._onRequestToDeletePost.bind(this, post)} />
            </Box>
          );
        }

        let colorIndexProp = 'neutral-1';

        let postChangeActions = (
          <Box direction="row" responsive={false} justify='end'>
            <Button plain={true} icon={<CloseIcon />}
              onClick={this._onRequestToCancelChange.bind(this, post)}
              a11yTitle={`Cancel ${post.action} ${post.title} post`} />
          </Box>
        );
        if (this.state.canceling && this.state.post.id === post.id) {
          postChangeActions = (
            <Box direction="row" responsive={false} justify='end'>
              <Box justify="center">
                <SpinningIcon />
              </Box>
              <Box pad={{ horizontal: 'small' }}>
                <span>Canceling...</span>
              </Box>
            </Box>
          );
        }

        if (post.pending) {
          colorIndexProp = 'grey-2';
          footerNode = (
            <Box justify='between' full='horizontal'>
              <Box direction="row" responsive={false}>
                <Box justify='center'>
                  <StatusIcon value='warning' />
                </Box>
                <Box justify='center'>
                  <span>{post.action} Pending Approval </span>
                </Box>
              </Box>
              {postChangeActions}
            </Box>
          );
        }

        return (
          <Tile key={`post_${index}`} align='start' pad='small'
            colorIndex={colorIndexProp}>
            <Box pad='small'>
              <Heading tag='h4' strong={true}>
                {post.title}
              </Heading>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <p>
                Posted {formattedDate} by {post.author}
              </p>
            </Box>
            <Footer justify='end' pad='small'>
              {footerNode}
            </Footer>
          </Tile>
        );
      }, this);

      return (
        <Box key={`month_group_${index}`} separator='top'>
          <Label uppercase={true}>{monthLabel}</Label>
          <Tiles size='large' flush={false}>
            {posts}
          </Tiles>
        </Box>
      );
    });
  }

  render () {

    this.archive = this.state.archive;
    this.loading = this.state.loading;
    if (store.useContext() && this.context.asyncData) {
      this.loading = false;
      this.archive = this.context.asyncData;
    }

    let archiveNode;
    let footerNode;
    if (this.archive) {
      footerNode = (
        <BlogFooter />
      );
      archiveNode = this._renderArchive();
    } else if (!this.loading) {
      archiveNode = (
        <h3>No posts have been found.</h3>
      );
    } else {
      footerNode = undefined;
      archiveNode = (
        <Loading />
      );
    }

    let errorNode;
    if (this.state.error) {
      errorNode = (
        <Error message={this.state.error} />
      );
    }

    let deleteLayer;
    if (this.state.delete) {
      deleteLayer = (
        <ManageDeletePost post={this.state.post}
          onCancel={this._onDeletePostCancel} onDelete={this._onDeletePost} />
      );
    }

    let cancelChangeLayer;
    if (this.state.cancelChange) {
      cancelChangeLayer = (
        <ManageCancelChangePost post={this.state.post}
          onCancel={this._onCancelChangeCancel} onConfirm={this._onCancelChange} />
      );
    }

    return (
      <Article scrollStep={false}>
        <ManageHeader />
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          <Heading tag="h2" strong={true}>Manage</Heading>
          {errorNode}
          {archiveNode}
        </Section>
        {footerNode}
        {deleteLayer}
        {cancelChangeLayer}
      </Article>
    );
  }
}

Manage.propTypes = {
  params: PropTypes.object
};

Manage.contextTypes = {
  asyncData: PropTypes.any
};
