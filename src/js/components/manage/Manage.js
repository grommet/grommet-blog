import React, { Component, PropTypes } from 'react';
import moment from 'moment';

import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Heading from 'grommet/components/Heading';
import Label from 'grommet/components/Label';
import Section from 'grommet/components/Section';
import Tile from 'grommet/components/Tile';
import Tiles from 'grommet/components/Tiles';

import EditIcon from 'grommet/components/icons/base/Edit';
import DeleteIcon from 'grommet/components/icons/base/Trash';
import StatusIcon from 'grommet/components/icons/Status';
import SpinningIcon from 'grommet/components/icons/Spinning';

import ManageHeader from './Header';
import ManageDeletePost from './ManageDeletePost';

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
    this._onDeleteSucceed = this._onDeleteSucceed.bind(this);
    this._onDeleteFailed = this._onDeleteFailed.bind(this);

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
      post: undefined
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

  _onDeletePostCancel () {
    this.setState({delete: false, post: undefined});
  }

  _onDeleteSucceed (archive) {
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

  _renderArchive () {
    let monthKeys = Object.keys(this.archive);
    return monthKeys.map((monthLabel, index) => {
      let posts = this.archive[monthLabel].map((post, index) => {
        let date = moment(post.createdAt);
        let formattedDate = date.format(
          'MMMM D, YYYY'
        );

        //pick a range from 0 - 4 based on the current index.
        const colorIndex = Math.round(index * 4 / monthKeys.length);

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
          const editIcon = <EditIcon a11yTitle={`Edit ${post.title} post`} />;
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

        let colorIndexProp = `neutral-${colorIndex + 1}`;
        if (post.pending) {
          colorIndexProp = 'disabled';
          footerNode = (
            <Box pad={{horizontal: 'small'}} direction="row" responsive={false}>
              <Box justify='center'>
                <StatusIcon value='warning' />
              </Box>
              <Box justify='center'>
                <span>Pending Approval</span>
              </Box>
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
    } else if (this.state.error) {
      archiveNode = (
        <Error message={this.state.error} />
      );
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

    let deleteLayer;
    if (this.state.delete) {
      deleteLayer = (
        <ManageDeletePost post={this.state.post}
          onCancel={this._onDeletePostCancel} onDelete={this._onDeletePost} />
      );
    }

    return (
      <Article scrollStep={false}>
        <ManageHeader />
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          <Heading tag="h2" strong={true}>Manage</Heading>
          {archiveNode}
        </Section>
        {footerNode}
        {deleteLayer}
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
