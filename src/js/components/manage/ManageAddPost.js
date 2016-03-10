// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';

import PostForm from './PostForm';

import store from '../../store';
import history from '../../RouteHistory';

export default class ManageAddPost extends Component {
  constructor () {
    super();

    this._onAddPost = this._onAddPost.bind(this);
    this._onAddPostSucceed = this._onAddPostSucceed.bind(this);
    this._onAddPostFailed = this._onAddPostFailed.bind(this);

    this.state = {
      error: undefined
    };
  }

  _onAddPost (post) {
    store.addPost(post).then(
      this._onAddPostSucceed, this._onAddPostFailed
    );
  }

  _onAddPostSucceed () {
    history.push('/manage');
  }

  _onAddPostFailed () {
    this.setState({
      error: 'Could not add post, please try again.'
    });
  }

  render () {
    return (
      <PostForm heading="Add Post" submitLabel="Add"
        error={this.state.error} onSubmit={this._onAddPost}
        busyMessage='Adding' />
    );
  }
}
