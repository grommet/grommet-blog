// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import fecha from 'fecha';
import { Link } from 'react-router';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';

import store from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';
import Error from './components/Error';

import { setDocumentTitle } from './utils/blog';

const HomeSection = (props) => {
  return (
    <Section {...props} pad={{vertical: "large"}}>
      <Box appCentered={true} full={true} justify="start"
        textCentered={true} align="center"
        pad={{vertical: "large"}}>
        {props.children}
      </Box>
    </Section>
  );
};

export default class Home extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getPosts();
  }

  constructor () {
    super();

    this._onPostsReceived = this._onPostsReceived.bind(this);
    this._onPostsFailed = this._onPostsFailed.bind(this);

    this.state = {
      posts: [],
      loading: true
    };
  }

  componentDidMount () {
    setDocumentTitle();
    store.getPosts().then(this._onPostsReceived, this._onPostsFailed);
  }

  componentWillReceiveProps () {
    store.getPosts().then(this._onPostsReceived, this._onPostsFailed);
  }

  _onPostsReceived (posts) {
    this.setState({ posts: posts, loading: false });
  }

  _onPostsFailed () {
    this.setState({
      posts: [],
      loading: false,
      error: 'Could not load posts. Make sure you have internet connection and try again.'
    });
  }

  render () {

    this.posts = this.state.posts;
    this.loading = this.state.loading;
    if (store.useContext() && this.context.asyncData) {
      this.loading = false;
      this.posts = this.context.asyncData;
    }

    let postsNode;
    let footerNode;
    if (this.posts.length > 0) {
      footerNode = (
        <Footer />
      );
      postsNode = this.posts.map((post, index) => {
        let formattedDate = fecha.format(
          new Date(post.createdAt), 'MMMM D, YYYY'
        );

        let backgroundOptions = {};
        if (post.coverImage) {
          backgroundOptions.backgroundImage = `url(${post.coverImage})`;
        } else {
          backgroundOptions.colorIndex = 'grey-2';
        }

        return (
          <Link to={`/post/${post.id}`} key={`post_${index}`}
            className='post-link'>
            <HomeSection colorIndex="dark" {...backgroundOptions}>
              <Heading><strong>{post.title}</strong></Heading>
              <h2>{`Posted ${formattedDate} by ${post.author}`}</h2>
            </HomeSection>
          </Link>
        );
      });
    } else if (this.state.error) {
      postsNode = (
        <Error message={this.state.error} />
      );
    } else if (!this.loading) {
      postsNode = (
        <h3>No posts have been found.</h3>
      );
    } else {
      postsNode = (
        <Loading />
      );
    }

    return (
      <Article scrollStep={false}>
        <Header />
        <Box primary={true}>
          {postsNode}
        </Box>
        {footerNode}
      </Article>
    );
  }
};

Home.propTypes = {
  asyncData: PropTypes.any
};
