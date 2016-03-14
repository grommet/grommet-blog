// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';

import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import SocialSlack from 'grommet/components/icons/base/SocialSlack';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialVimeo from 'grommet/components/icons/base/SocialVimeo';

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
        direction='column' primary={true} justify='between'
        pad={{horizontal: 'medium', vertical: 'medium', between: 'medium'}}>
        <Box align='center' justify='center'>
          <span>This work is licensed under the <a href='http://creativecommons.org/licenses/by/4.0/legalcode' target='_blank'>Creative Commons Attribution 4.0 International License.</a></span>
        </Box>
        <Box align='center' justify='center'>
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
      </Footer>
    );
  }
}
