// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';

import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import GrommetLogo from 'grommet/components/icons/Grommet';
import SocialSlack from 'grommet/components/icons/base/SocialSlack';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialVimeo from 'grommet/components/icons/base/SocialVimeo';

const currentYear = new Date().getFullYear();

export default class BlogFooter extends Component {
  render () {
    let socialSlack = (
      <SocialSlack a11yTitleId='go-to-slack'
        a11yTitle='Grommet Slack page' />
    );

    let socialTwitter = (
      <SocialTwitter a11yTitleId='go-to-twitter'
        a11yTitle='Grommet Twitter page' />
    );

    let socialFacebook = (
      <SocialFacebook a11yTitleId='go-to-facebook'
        a11yTitle='Grommet Facebook page' />
    );

    let socialVimeo = (
      <SocialVimeo a11yTitleId='go-to-vimeo' a11yTitle='Grommet Vimeo page' />
    );

    return (
      <Footer size='small' appCentered={true} colorIndex='light-2'
        direction='column' primary={true}
        pad={{horizontal: 'medium', vertical: 'medium', between: 'medium'}}>
        <Box direction='row' justify='between' align='center'>
          <GrommetLogo />
          <Menu inline={true} direction='row' size='small'
            align='start' responsive={false}>
            <Anchor href='http://slackin.grommet.io'
              icon={socialSlack} target='_blank' />
            <Anchor href='https://twitter.com/grommetux'
              icon={socialTwitter} target='_blank' />
            <Anchor href='https://www.facebook.com/grommetux'
              icon={socialFacebook} target='_blank' />
            <Anchor href='https://vimeo.com/grommetux'
              icon={socialVimeo} target='_blank' />
          </Menu>
        </Box>
        <Box direction='row' full='horizontal' justify='between' align='center'>
          <span>
            <strong>Grommet</strong> {String.fromCharCode(169)} {currentYear} | All rights reserved.
          </span>
        </Box>
      </Footer>
    );
  }
}
