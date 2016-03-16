// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import fecha from 'fecha';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Search from 'grommet/components/Search';

import BlogHeader from './Header';
import Footer from './Footer';
import Loading from './Loading';
import Error from './Error';
import store from '../store';
import history from '../RouteHistory';

import { setDocumentTitle } from '../utils/blog';

export default class BlogSearch extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.search(location.query.q);
  }

  constructor () {
    super();

    this._onChange = this._onChange.bind(this);
    this._renderPosts = this._renderPosts.bind(this);
    this._onSearchResultsFailed = this._onSearchResultsFailed.bind(this);
    this._onSearchResultsReceived = this._onSearchResultsReceived.bind(this);

    this.state = {
      value: '',
      posts: undefined,
      searching: false
    };
  }

  componentDidMount () {
    setDocumentTitle('Search');
    this.refs.search.focus();
    if (this.props.location.query.q) {
      this.setState({searching: true, value: this.props.location.query.q });
      store.search(this.props.location.query.q).then(
        this._onSearchResultsReceived, this._onSearchResultsFailed
      );
    }
  }

  _onChange (event) {
    const value = event.target.value;

    if (value === '') {
      this.props.location.query.q = undefined;
      history.replace(this.props.location);
    } else {
      this.props.location.query.q = value;
      history.replace(this.props.location);
    }

    if (value.length > 2) {
      this.setState({posts: undefined, searching: true, value: value});
      store.search(value).then(
        this._onSearchResultsReceived, this._onSearchResultsFailed
      );
    } else {
      this.setState({ posts: undefined, searching: false, value: value });
    }

  }

  _onSearchResultsReceived (posts) {
    this.setState({
      posts: posts || [],
      value: this.props.location.query.q,
      searching: false
    });
  }

  _onSearchResultsFailed (err) {
    this.setState({
      posts: [],
      searching: false,
      error: 'Could not load posts. Make sure you have internet connection and try again.'
    });
  }

  _renderPosts () {
    let posts = this.posts.map((post, index) => {
      const createdAtDate = new Date(post.createdAt);
      let day = fecha.format(createdAtDate, 'DD');
      let month = fecha.format(createdAtDate, 'MM');
      let year = fecha.format(createdAtDate, 'YYYY');
      let formattedDate = fecha.format(
        createdAtDate, 'MMMM D, YYYY'
      );
      let formattedAuthor = post.author.replace(' ', '').toLowerCase();
      return (
        <Box key={`post_${index}`} pad={{ vertical: 'small' }}>
          <h2 className='post__title'>
            <Link to={`/post/${post.id}`}>
              {post.title}
            </Link>
          </h2>
          <h3 className='post__title'>
            Posted <Link to={`/archive/${year}/${month}/${day}`}>
              {formattedDate}
            </Link> by <Link to={`/archive/author/${formattedAuthor}`}>
              {post.author}
            </Link>
          </h3>
        </Box>
      );
    });

    return (
      <Box>
        {posts}
      </Box>
    );
  }

  render () {

    this.posts = this.state.posts;
    if (store.useContext() && this.context.asyncData) {
      this.posts = this.context.asyncData;
    }

    let postsNode;
    let footerNode;
    if (this.posts && this.posts.length > 0) {
      postsNode = this._renderPosts();
      footerNode = (
        <Footer />
      );
    } else if (this.state.error) {
      postsNode = (
        <Error message={this.state.error} />
      );
    } else if (this.posts && this.posts.length === 0) {
      postsNode = (
        <Box pad='small'>
          <h3>No post found matching the search query.</h3>
        </Box>
      );
    } else if (this.state.searching) {
      postsNode = (
        <Loading />
      );
    }

    return (
      <Article scrollStep={false}>
        <BlogHeader />
        <Section pad={{ horizontal: 'large', vertical: 'small' }}
          primary={true}>
          <form onSubmit={event => event.preventDefault()}>
            <Search ref="search" iconAlign="start" inline={true}
              responsive={false} className="flex" fill={true}
              value={this.state.value}
              placeHolder="Search Blog"
              onDOMChange={this._onChange} />
          </form>
          {postsNode}
        </Section>
        {footerNode}
      </Article>
    );
  }
};

BlogSearch.propTypes = {
  asyncData: PropTypes.any
};
