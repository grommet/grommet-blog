// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import DisqusThread from 'react-disqus-thread';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';

import BlogHeader from './Header';
import Footer from './Footer';
import Loading from './Loading';
import Error from './Error';
import PostBody from './PostBody';

import store from '../store';

import { setDocumentTitle } from '../utils/blog';

export default class Post extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getPost(params.splat);
  }

  constructor () {
    super();

    this._onPostReceived = this._onPostReceived.bind(this);
    this._onPostFailed = this._onPostFailed.bind(this);

    this.state = {
      post: undefined,
      loading: true
    };
  }

  componentDidMount () {
    store.getPost(this.props.params.splat).then(
      this._onPostReceived, this._onPostFailed
    );
  }

  componentWillReceiveProps () {
    store.getPost(this.props.params.splat).then(
      this._onPostReceived, this._onPostFailed
    );
  }

  _onPostReceived (post) {
    if (post) {
      setDocumentTitle(post.title);
      this.setState({ post: post, loading: false });
    } else {
      this.setState({ post: post, loading: false });
    }
  }

  _onPostFailed () {
    this.setState({
      post: undefined,
      loading: false,
      error: 'Could not load post. Make sure you have internet connection and try again.'
    });
  }

  _renderComment () {
    return (
      <Box pad={{ horizontal: 'large' }}>
        <DisqusThread shortname='grommet' identifier={this.post.id}
          title={this.post.title} />
      </Box>
    );
  }

  render () {

    this.post = this.state.post;
    this.loading = this.state.loading;
    if (store.useContext() && this.context.asyncData) {
      this.loading = false;
      this.post = this.context.asyncData;
    }

    let postNode;
    if (this.post) {
      postNode = (
        <div>
          <Box primary={true}>
            <PostBody post={this.post} />
          </Box>
          {this._renderComment()}
          <Footer />
        </div>
      );
    } else if (this.state.error) {
      postNode = (
        <Error message={this.state.error} />
      );
    } else if (!this.loading) {
      postNode = (
        <Box pad={{vertical: 'small', horizontal: 'large'}}>
          <h3>No post has been found.</h3>
        </Box>
      );
    } else {
      postNode = (
        <Loading />
      );
    }

    return (
      <Article scrollStep={false}>
        <BlogHeader />
        {postNode}
      </Article>
    );
  }
};

Post.propTypes = {
  params: PropTypes.object
};

Post.contextTypes = {
  asyncData: PropTypes.any
};
