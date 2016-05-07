// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';

import PostForm from './PostForm';
import ManageHeader from './Header';

import store from '../../store';
import history from '../../RouteHistory';
import Error from '../Error';
import Loading from '../Loading';

export default class ManageEditPost extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getPost(params.splat, true);
  }

  constructor () {
    super();

    this._onEditPost = this._onEditPost.bind(this);
    this._onEditPostSucceed = this._onEditPostSucceed.bind(this);
    this._onEditPostFailed = this._onEditPostFailed.bind(this);
    this._onGetPostSucceed = this._onGetPostSucceed.bind(this);
    this._onGetPostFailed = this._onGetPostFailed.bind(this);

    this.state = {
      error: undefined,
      loading: true
    };
  }

  componentDidMount () {
    store.getPost(this.props.params.splat, true).then(
      this._onGetPostSucceed, this._onGetPostFailed
    );
  }

  _onGetPostSucceed (post) {
    this.setState({
      post: post
    });
  }

  _onGetPostFailed () {
    this.setState({
      error: 'Could not retrieve post, please try again.'
    });
  }

  _onEditPost (post) {
    store.editPost(post).then(
      this._onEditPostSucceed, this._onEditPostFailed
    );
  }

  _onEditPostSucceed () {
    history.push('/manage');
  }

  _onEditPostFailed () {
    this.setState({
      error: 'Could not edit post, please try again.'
    });
  }

  render () {

    this.post = this.state.post;
    this.loading = this.state.loading;
    if (store.useContext() && this.context.asyncData) {
      this.loading = false;
      this.post = this.context.post;
    }

    let editPostNode;
    if (this.post) {
      editPostNode = (
        <PostForm heading="Edit Post" submitLabel="Save"
          error={this.state.error} onSubmit={this._onEditPost}
          post={this.state.post} busyMessage='Updating' />
      );
    } else if (this.state.error) {
      editPostNode = (
        <Error message={this.state.error} />
      );
    } else if (!this.loading) {
      editPostNode = (
        <h3>No post has been found.</h3>
      );
    } else {
      editPostNode = (
        <div>
          <ManageHeader />
          <Loading />
        </div>
      );
    }

    return (
      <div>
        {editPostNode}
      </div>
    );
  }
}
