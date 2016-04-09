// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import Add from 'grommet/components/icons/base/Add';

import history from '../../RouteHistory';

export default class BlogHeader extends Component {

  _onAddPost (event) {
    event.preventDefault();
    history.push('/manage/post/add');
  }

  render () {

    const logo = (
      <Link to="/">
        <Title responsive={false}>
          <GrommetLogo a11yTitle=""/>
          <Heading tag="h3">Blog</Heading>
        </Title>
      </Link>
    );

    return (
      <Header appCentered={true} size="large" justify="between"
        pad={{horizontal: 'medium', vertical: 'none'}}>
        {logo}
        <Box direction="row" responsive={false}>
          <Anchor href='/manage/post/add' icon={<Add />} onClick={this._onAddPost}
            a11yTitle='Add Post' />
        </Box>
      </Header>
    );
  }
};

export default BlogHeader;
