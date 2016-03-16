// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import fecha from 'fecha';
import { Link } from 'react-router';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Heading from 'grommet/components/Heading';
import Label from 'grommet/components/Label';

import BlogHeader from './Header';
import Footer from './Footer';
import Loading from './Loading';
import Error from './Error';
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

    this._onArchiveReceived = this._onArchiveReceived.bind(this);
    this._onArchiveFailed = this._onArchiveFailed.bind(this);
    this._renderArchive = this._renderArchive.bind(this);

    this.state = {
      archive: undefined,
      loading: true
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
    this.setState({ archive: archive, loading: false });
  }

  _onArchiveFailed () {
    this.setState({
      archive: undefined,
      loading: false,
      error: 'Could not load posts. Make sure you have internet connection and try again.'
    });
  }

  _renderArchive () {
    return Object.keys(this.archive).map((monthLabel, index) => {
      let posts = this.archive[monthLabel].map((post, index) => {
        const createAtDate = new Date(post.createdAt);
        let day = fecha.format(createAtDate, 'DD');
        let month = fecha.format(createAtDate, 'MM');
        let year = fecha.format(createAtDate, 'YYYY');
        let formattedDate = fecha.format(
          createAtDate, 'MMMM D, YYYY'
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
        <Box key={`month_group_${index}`} pad={{ vertical: 'small' }}
          separator="top">
          <Label uppercase={true}>{monthLabel}</Label>
          {posts}
        </Box>
      );
    });
  }

  render () {

    this.archive = this.state.archive;
    this.loading = this.state.loading;
    if (store.useContext() && this.context.asyncData) {
      this.loading = false;
      this.archive = this.context.asyncData;
    }

    let archiveNode;
    let footerNode;
    if (this.archive) {
      footerNode = (
        <Footer />
      );
      archiveNode = this._renderArchive();
    } else if (this.state.error) {
      archiveNode = (
        <Error message={this.state.error} />
      );
    } else if (!this.loading) {
      archiveNode = (
        <h3>No posts have been found.</h3>
      );
    } else {
      archiveNode = (
        <Loading />
      );
    }

    return (
      <Article scrollStep={false}>
        <BlogHeader />
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          <Heading tag="h2" strong={true}>Archive</Heading>
          {archiveNode}
        </Section>
        {footerNode}
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
