// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { Link } from 'react-router';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';

import BlogHeader from './Header';
import Footer from './Footer';
import store from '../store';

import { setDocumentTitle } from '../utils/blog';

export default class Archive extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getArchive(location.pathname);
  }

  constructor () {
    super();

    this._onSearchChange = this._onSearchChange.bind(this);
    this._onArchiveReceived = this._onArchiveReceived.bind(this);
    this._renderArchive = this._renderArchive.bind(this);

    this.state = {
      archive: undefined,
      searchValue: ''
    };
  }

  componentDidMount () {
    setDocumentTitle('Archive');
    store.getArchive(location.pathname).then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  componentWillReceiveProps () {
    store.getArchive(location.pathname).then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  _onArchiveReceived (archive) {
    if (archive && Object.keys(archive).length === 0) {
      archive = undefined;
    }
    this.setState({ archive: archive });
  }

  _onArchiveFailed (err) {
    //TODO: handle errors
    console.log(err);
  }

  _onSearchChange () {
    //no-op
  }

  _renderArchive () {
    return Object.keys(this.archive).map((monthLabel, index) => {
      let posts = this.archive[monthLabel].map((post, index) => {
        let date = moment(post.createdAt);
        let day = date.format('DD');
        let month = date.format('MM');
        let year = date.format('YYYY');
        let formattedDate = date.format(
          'MMMM D, YYYY'
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
        <Box key={`month_group_${index}`} pad={{ vertical: 'small' }}>
          <h2><strong>{monthLabel}</strong></h2>
          {posts}
        </Box>
      );
    });
  }

  render () {

    this.archive = this.state.archive;
    if (store.useContext() && this.context.asyncData) {
      this.archive = this.context.asyncData;
    }

    let archiveNode;
    if (this.archive) {
      archiveNode = this._renderArchive();
    } else {
      archiveNode = (
        <h3>No posts have been found.</h3>
      );
    }

    return (
      <Article scrollStep={false}>
        <BlogHeader />
        <Section pad={{ horizontal: 'large' }}>
          <Header><h1>Archive</h1></Header>
          {archiveNode}
        </Section>
        <Footer />
      </Article>
    );
  }
};

Archive.propTypes = {
  params: PropTypes.object
};

Archive.contextTypes = {
  asyncData: PropTypes.any
};
