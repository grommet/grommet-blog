import React from 'react';

import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Paragraph from 'grommet/components/Paragraph';

import BlogHeader from './Header';
import Footer from './Footer';

const NotFound = () => {
  return (
    <Article scrollStep={false}>
      <BlogHeader />
      <Section pad={{ horizontal: 'large' }}>
        <Header><h1>Oops!</h1></Header>
        <h3>This page can't be found.</h3>
        <Paragraph>
          It looks like nothing was found at this location.
          Maybe try searching for what you need?
        </Paragraph>
      </Section>
      <Footer />
    </Article>
  );
};

export default NotFound;
