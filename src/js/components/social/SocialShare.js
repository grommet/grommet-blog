import React, { Component } from 'react';
import Anchor from 'grommet/components/Anchor';

export default class SocialShare extends Component {
  render () {
    const Icon = this.icon;
    const iconNode = (
      <Icon a11yTitle={`Share on ${this.name}`} />
    );

    return (
      <Anchor href={this.url} icon={iconNode} target="_blank" />
    );
  }
};
