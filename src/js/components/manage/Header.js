// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';
import { Link } from 'react-router';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import GrommetLogo from 'grommet/components/icons/Grommet';

import Add from 'grommet/components/icons/base/Add';

import AddPost from './AddPost';

export default class BlogHeader extends Component {

  constructor () {
    super();

    this._onRequestForAdd = this._onRequestForAdd.bind(this);
    this._onRequestForClose = this._onRequestForClose.bind(this);

    this.state = {
      add: false
    };
  }

  _onRequestForAdd () {
    this.setState({ add: true });
  }

  _onRequestForClose () {
    this.setState({ add: false });
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

    let addLayer;
    if (this.state.add) {
      addLayer = (
        <AddPost onClose={this._onRequestForClose}
          onSubmit={this.props.onAddPost} />
      );
    }
    const add = (
      <Button icon={<Add />} onClick={this._onRequestForAdd}
        a11yTitle='Add Post' />
    );

    return (
      <div>
        <Header appCentered={true} size="large" justify="between"
          pad={{horizontal: 'medium', vertical: 'none'}}>
          {logo}
          <Box direction="row" responsive={false}>
            {add}
          </Box>
        </Header>
        {addLayer}
      </div>
    );
  }
};

export default BlogHeader;
