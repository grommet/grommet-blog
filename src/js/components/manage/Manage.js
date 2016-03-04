import React, { Component, PropTypes } from 'react';
import moment from 'moment';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Header from 'grommet/components/Header';
import Label from 'grommet/components/Label';
import Section from 'grommet/components/Section';
import Tile from 'grommet/components/Tile';
import Tiles from 'grommet/components/Tiles';

import EditIcon from 'grommet/components/icons/base/Edit';

import ManageHeader from './Header';
import BlogFooter from '../Footer';
import store from '../../store';

import { setDocumentTitle } from '../../utils/blog';

export default class Manage extends Component {

  /**
  * used by the server to achieve isomorphic with async data.
  * This function <b>must</b> return a promise!
  * See /server/blog.js.
  */
  static fetchData (location, params, appContext) {
    store.addContext(appContext);
    return store.getArchive();
  }

  constructor () {
    super();

    this._onArchiveReceived = this._onArchiveReceived.bind(this);
    this._renderArchive = this._renderArchive.bind(this);

    this.state = {
      archive: undefined
    };
  }

  componentDidMount () {
    setDocumentTitle('Manage');
    store.getArchive().then(
      this._onArchiveReceived, this._onArchiveFailed
    );
  }

  componentWillReceiveProps () {
    store.getArchive().then(
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

  _renderArchive () {
    return Object.keys(this.archive).map((monthLabel, index) => {
      let posts = this.archive[monthLabel].map((post, index) => {
        let date = moment(post.createdAt);
        let formattedDate = date.format(
          'MMMM D, YYYY'
        );
        return (
          <Tile key={`post_${index}`} align='start' pad='small'
            colorIndex={`neutral-${index + 1}`}>
            <Header tag='h4' size='small' pad={{horizontal: 'small'}}>
              <strong>{post.title}</strong>
            </Header>
            <Box pad={{horizontal: 'small'}}>
              <p>
                Posted {formattedDate} by {post.author}
              </p>
            </Box>
            <Footer justify='end' pad='small'>
              <Box pad={{horizontal: 'small'}}>
                <EditIcon a11yTitle={`Edit ${post.title} post`} />
              </Box>
            </Footer>
          </Tile>
        );
      });

      return (
        <Box key={`month_group_${index}`} separator='top'>
          <Label uppercase={true}>{monthLabel}</Label>
          <Tiles size='large' flush={false}>
            {posts}
          </Tiles>
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
        <ManageHeader />
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          {archiveNode}
        </Section>
        <BlogFooter />
      </Article>
    );
  }
}

Manage.propTypes = {
  params: PropTypes.object
};

Manage.contextTypes = {
  asyncData: PropTypes.any
};
