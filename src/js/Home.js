// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { Link } from 'react-router';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';

import store from './store';
import Header from './components/Header';
import Footer from './components/Footer';

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

    this.state = {
      posts: []
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
    this.setState({ posts: posts });
  }

  _onPostsFailed (err) {
    //TODO: handle errors
    console.log(err);
  }

  render () {

    this.posts = this.state.posts;
    if (store.useContext() && this.context.asyncData) {
      this.posts = this.context.asyncData;
    }

    let postsNode = this.posts.map((post, index) => {
      let formattedDate = moment(post.createdAt).format(
        'MMMM D, YYYY'
      );
      return (
        <Link to={`/post/${post.id}`} key={`post_${index}`}
          className='post-link'>
          <HomeSection colorIndex="dark"
            backgroundImage={`url(${post.coverImage})`}>
            <Heading><strong>{post.title}</strong></Heading>
            <h2>{`Posted ${formattedDate} by ${post.author}`}</h2>
          </HomeSection>
        </Link>
      );
    });

    return (
      <Article scrollStep={false}>
        <Header />
        {postsNode}
        <Footer />
      </Article>
    );
  }
};

Home.propTypes = {
  asyncData: PropTypes.any
};
