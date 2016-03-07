// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import Add from 'grommet/components/icons/base/Add';

export default class BlogHeader extends Component {

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
      <Button icon={<Add />} onClick={this.props.onRequestToAdd}
        a11yTitle='Add Post' />
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
