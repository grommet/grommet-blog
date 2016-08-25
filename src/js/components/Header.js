// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import history from '../RouteHistory';

import Search from 'grommet/components/icons/base/Search';
import Archive from 'grommet/components/icons/base/Archive';

export default class BlogHeader extends Component {

  _onSearch (event) {
    event.preventDefault();
    history.push('/search');
  }

  _onArchive (event) {
    event.preventDefault();
    history.push('/archive');
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

    const search = (
      <Anchor icon={<Search />} href="/search" onClick={this._onSearch} />
    );

    const archive = (
      <Anchor icon={<Archive />} href="/archive" onClick={this._onArchive} />
    );

    return (
      <Header appCentered={true} size="large" justify="between"
        pad={{horizontal: 'medium', vertical: 'none'}}>
        {logo}
        <Box direction="row" responsive={false}>
          {search}
          {archive}
        </Box>
      </Header>
    );
  }
};
