// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import marked from 'marked';
import DisqusThread from 'react-disqus-thread';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Headline from 'grommet/components/Headline';
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialLinkedin from 'grommet/components/icons/base/SocialLinkedin';
import SocialReddit from 'grommet/components/icons/base/SocialReddit';

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
    this.setState({ post: post }, () => {
      if (window.addthis) {
        let target = (
          `http://blog.grommet.io/${post.id}`
        );
        window.addthis_share.url = target;
        window.addthis_share.title = post.title;
        window.addthis.toolbox('.addthis_toolbox');
      }
    });
  }

  _onPostFailed (err) {
    //TODO: handle errors
    console.log(err);
  }

  _onSocialClick (event) {
    event.preventDefault();
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
        <div data-addthis-url={target}
          data-addthis-title={post.title} className="addthis_toolbox">
          <Box responsive={false} direction="row">
            <Box pad={{horizontal: 'small'}}>
              <a className="addthis_button_facebook"
                href="#" title="Facebook" onClick={this._onSocialClick}>
                <SocialFacebook a11yTitle="Share on Facebook" />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className="addthis_button_twitter"
                href="#" title="Twitter" onClick={this._onSocialClick}>
                <SocialTwitter a11yTitle="Share on Twitter" />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className="addthis_button_linkedin"
                href="#" title="Linkedin" onClick={this._onSocialClick}>
                <SocialLinkedin a11yTitle="Share on Linkedin" />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className="addthis_button_reddit"
                href="#" title="Reddit" onClick={this._onSocialClick}>
                <SocialReddit a11yTitle="Share on Reddit" />
              </a>
            </Box>
          </Box>
        </div>
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
        <Box primary={true}>
          {postNode}
        </Box>
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
