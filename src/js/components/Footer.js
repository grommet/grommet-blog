// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React, { Component } from 'react';

import Anchor from 'grommet/components/Anchor';
import Footer from 'grommet/components/Footer';
import Tiles from 'grommet/components/Tiles';
import SocialSlack from 'grommet/components/icons/base/SocialSlack';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialVimeo from 'grommet/components/icons/base/SocialVimeo';

export default class BlogFooter extends Component {
  render () {
    return (
      <Footer primary={true} appCentered={true} direction="column"
        align="center" pad="large" size="small">
        <Tiles fill={true} flush={true}>
          <Anchor href="http://slackin.grommet.io" icon={<SocialSlack />}
            target="_blank" label='grommet' />
          <Anchor href="https://twitter.com/grommetux" icon={<SocialTwitter />}
              target="_blank" label='@GrommetUX' />
          <Anchor href="https://www.facebook.com/grommetux" icon={<SocialFacebook />}
              target="_blank" label='GrommetUX' />
          <Anchor href="https://vimeo.com/grommetux" icon={<SocialVimeo />}
              target="_blank" label='grommetux' />
        </Tiles>
        <p>
          This work is licensed under the <a href="http://creativecommons.org/licenses/by/4.0/legalcode" target="_blank">
            Creative Commons Attribution 4.0 International License.
          </a>
        </p>
      </Footer>
    );
  }
}
