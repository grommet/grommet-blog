// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import history from '../../RouteHistory';

import Add from 'grommet/components/icons/base/Add';

export default class BlogHeader extends Component {

  _onAdd (event) {
    event.preventDefault();
    history.push('/manage/add');
  }

  render () {

    const logo = (
      <Link to="/">
        <Title responsive={false}>
          <GrommetLogo a11yTitle=""/>
          Blog
        </Title>
      </Link>
    );

    const add = (
      <Anchor icon={<Add />} href="/manage/add"
        onClick={this._onAdd} a11yTitle='Add Post' />
    );

    return (
      <Header appCentered={true} size="large" justify="between"
        pad={{horizontal: 'medium', vertical: 'none'}}>
        {logo}
        <Box direction="row" responsive={false}>
          {add}
        </Box>
      </Header>
    );
  }
};

export default BlogHeader;
