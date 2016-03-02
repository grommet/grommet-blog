// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import marked from 'marked';
import DisqusThread from 'react-disqus-thread';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Headline from 'grommet/components/Headline';
import FacebookShare from './social/FacebookShare';
import TwitterShare from './social/TwitterShare';
import LinkedinShare from './social/LinkedinShare';
import RedditShare from './social/RedditShare';

import BlogHeader from './Header';
import Footer from './Footer';

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
    this._renderPost = this._renderPost.bind(this);
    this._renderPostHeader = this._renderPostHeader.bind(this);

    this.state = {
      post: undefined
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
    setDocumentTitle(post.title);
    this.setState({ post: post });
  }

  _onPostFailed (err) {
    //TODO: handle errors
    console.log(err);
  }

  _renderPostHeader () {
    let post = this.post;
    let date = moment(post.createdAt);
    let day = date.format('DD');
    let month = date.format('MM');
    let year = date.format('YYYY');
    let formattedDate = date.format(
      'MMMM D, YYYY'
    );
    let formattedAuthor = post.author.replace(' ', '').toLowerCase();

    let target = (
      `http://blog.grommet.io/${post.id}`
    );

    return (
      <Box pad="large" colorIndex="neutral-2"
        backgroundImage={`url(${post.coverImage})`}>
        <Headline><strong>{post.title}</strong></Headline>
        <h3>
          Posted <Link to={`/archive/${year}/${month}/${day}`}>
            {formattedDate}
          </Link> by <Link to={`/archive/author/${formattedAuthor}`}>
            {post.author}
          </Link>
        </h3>
        <Box responsive={false} direction="row">
          <FacebookShare target={target} />
          <TwitterShare target={target} />
          <LinkedinShare target={target} />
          <RedditShare target={target} />
        </Box>
      </Box>
    );
  }

  _renderPost () {
    let htmlContent = {
      __html: marked(this.post.content)
    };
    return (
      <div>
        {this._renderPostHeader()}
        <Box pad={{ horizontal: 'large' }}
          className='markdown__container'>
          <div dangerouslySetInnerHTML={htmlContent} />
        </Box>
      </div>
    );
  }

  _renderComment () {
    return (
      <Box pad={{ horizontal: 'large' }}>
        <DisqusThread shortname="grommet" identifier={this.post.id}
          title={this.post.title} />
      </Box>
    );
  }

  render () {

    this.post = this.state.post;
    if (store.useContext() && this.context.asyncData) {
      this.post = this.context.asyncData;
    }

    let postNode;
    let comment;
    if (this.post) {
      postNode = (
        this._renderPost()
      );

      comment = (
        this._renderComment()
      );
    }

    return (
      <Article scrollStep={false}>
        <BlogHeader />
        {postNode}
        {comment}
        <Footer />
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
