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
import Loading from './Loading';
import Error from './Error';

import store from '../store';

import { setDocumentTitle } from '../utils/blog';

//hjjs configuration
import hljs from 'highlight.js/lib/highlight';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import scss from 'highlight.js/lib/languages/scss';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('scss', scss);

var renderer = new marked.Renderer();

renderer.image = function (href, title, text) {
  return `
    <figure>
      <a href=${href} target="_blank">
        <img src=${href} alt=${text} />
      </a>
      <figcaption>
       ${text}
      </figcaption>
    </figure>
  `;
};

marked.setOptions({
  renderer: renderer,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

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
    this._renderPost = this._renderPost.bind(this);
    this._renderPostHeader = this._renderPostHeader.bind(this);
    this._highlightCode = this._highlightCode.bind(this);

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

  _highlightCode () {
    var nodes = document.querySelectorAll('pre code');
    for (var i = 0; i < nodes.length; i++) {
      hljs.highlightBlock(nodes[i]);
    }
  }

  _onPostReceived (post) {
    if (post) {
      setDocumentTitle(post.title);
      this.setState({ post: post, loading: false }, () => {
        if (window.addthis) {
          let target = (
            `http://blog.grommet.io/${post.id}`
          );
          window.addthis_share.url = target;
          window.addthis_share.title = post.title;
          window.addthis.toolbox('.addthis_toolbox');
        }

        this._highlightCode();
      });
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

    let backgroundOptions = {};
    if (post.coverImage) {
      backgroundOptions.backgroundImage = `url(${post.coverImage})`;
    } else {
      backgroundOptions.colorIndex = 'grey-2';
    }

    return (
      <Box pad='large' colorIndex='neutral-2' {...backgroundOptions}
        align='center' justify='center'>
        <Headline><strong>{post.title}</strong></Headline>
        <h3>
          Posted <Link to={`/archive/${year}/${month}/${day}`}>
            {formattedDate}
          </Link> by <Link to={`/archive/author/${formattedAuthor}`}>
            {post.author}
          </Link>
        </h3>
        <div data-addthis-url={target}
          data-addthis-title={post.title} className='addthis_toolbox'>
          <Box responsive={false} direction='row'>
            <Box pad={{horizontal: 'small'}}>
              <a className='addthis_button_facebook'
                href='#' title='Facebook' onClick={this._onSocialClick}>
                <SocialFacebook a11yTitle='Share on Facebook' />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className='addthis_button_twitter'
                href='#' title='Twitter' onClick={this._onSocialClick}>
                <SocialTwitter a11yTitle='Share on Twitter' />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className='addthis_button_linkedin'
                href='#' title='Linkedin' onClick={this._onSocialClick}>
                <SocialLinkedin a11yTitle='Share on Linkedin' />
              </a>
            </Box>
            <Box pad={{horizontal: 'small'}}>
              <a className='addthis_button_reddit'
                href='#' title='Reddit' onClick={this._onSocialClick}>
                <SocialReddit a11yTitle='Share on Reddit' />
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
        <Box pad={{ horizontal: 'large' }} align="center" justify="center"
          className='markdown__container'>
          <div dangerouslySetInnerHTML={htmlContent} />
        </Box>
      </div>
    );
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
            {this._renderPost()}
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
