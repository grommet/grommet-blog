// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';

import history from '../../RouteHistory';

export default class BlogHeader extends Component {

  _onAddPost (event) {
    event.preventDefault();
    history.push('/manage/post/add');
  }

  _onClosePost () {
    history.push('/manage');
  }

  render () {

    const logo = (
      <Link to="/manage">
        <Title responsive={false}>
          <GrommetLogo a11yTitle=""/>
          Blog
        </Title>
      </Link>
    );

    let control;
    if (this.props.add) {
      control = (
        <Button icon={<Close />} onClick={this._onClosePost}
          a11yTitle='Close Add Post' />
      );
    } else {
      control = (
        <Anchor href='/manage/post/add' icon={<Add />} onClick={this._onAddPost}
          a11yTitle='Add Post' />
      );
    }

    return (
      <Header appCentered={true} size="large" justify="between"
        pad={{horizontal: 'medium', vertical: 'none'}}>
        {logo}
        <Box direction="row" responsive={false}>
          {control}
        </Box>
      </Header>
    );
  }
};

export default BlogHeader;
