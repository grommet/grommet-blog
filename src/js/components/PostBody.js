import React, {Component} from 'react';
import { renderToString } from 'react-dom/server';
import { Link } from 'react-router';
import moment from 'moment';
import marked from 'marked';

import Box from 'grommet/components/Box';
import Headline from 'grommet/components/Headline';
import Paragraph from 'grommet/components/Paragraph';

import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialLinkedin from 'grommet/components/icons/base/SocialLinkedin';
import SocialReddit from 'grommet/components/icons/base/SocialReddit';

//hjjs configuration
import hljs from 'highlight.js/lib/highlight';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import scss from 'highlight.js/lib/languages/scss';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('scss', scss);

var renderer = new marked.Renderer();

renderer.image = (href, title, text) => {
  let caption = '';
  if (text && text !== '') {
    caption = `
      <figcaption>
       ${text}
      </figcaption>
    `;
  }
  return `
    <figure>
      <a href=${href} target="_blank">
        <img src=${href} alt=${text} />
      </a>
      ${caption}
    </figure>
  `;
};

renderer.paragraph = (text) => {
  if (/<[a-z][\s\S]*>/i.exec(text)) {
    return text;
  } else {
    return renderToString(<Paragraph size="large">{text}</Paragraph>);
  }
};

marked.setOptions({
  renderer: renderer,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

function _onSocialClick (event) {
  event.preventDefault();
}

function _renderPostHeader (post, preview) {
  let date = moment(post.createdAt);
  let day = date.format('DD');
  let month = date.format('MM');
  let year = date.format('YYYY');
  let formattedDate = date.format(
    'MMMM D, YYYY'
  );

  const author = post.author || 'AUTHOR_NAME';
  let formattedAuthor = (
    author.replace(' ', '').toLowerCase()
  );

  let target = (
    `http://blog.grommet.io/${post.id || ''}`
  );

  let backgroundOptions = {};
  if (post.coverImage) {
    backgroundOptions.backgroundImage = `url(${post.coverImage})`;
  } else {
    backgroundOptions.colorIndex = 'grey-2';
  }

  let secondaryHeader;
  if (preview) {
    secondaryHeader = (
      <h3>
        Posted {formattedDate} by {author}
      </h3>
    );
  } else {
    secondaryHeader = (
      <h3>
        Posted <Link to={`/archive/${year}/${month}/${day}`}>
          {formattedDate}
        </Link> by <Link to={`/archive/author/${formattedAuthor}`}>
          {author}
        </Link>
      </h3>
    );
  }
  return (
    <Box pad='large' colorIndex='neutral-2' {...backgroundOptions}
      align='center' justify='center'>
      <Headline><strong>{post.title || 'POST_TITLE'}</strong></Headline>
      {secondaryHeader}
      <div data-addthis-url={target}
        data-addthis-title={post.title} className='addthis_toolbox'>
        <Box responsive={false} direction='row'>
          <Box pad={{horizontal: 'small'}}>
            <a className='addthis_button_facebook'
              href='#' title='Facebook' onClick={_onSocialClick}>
              <SocialFacebook a11yTitle='Share on Facebook' />
            </a>
          </Box>
          <Box pad={{horizontal: 'small'}}>
            <a className='addthis_button_twitter'
              href='#' title='Twitter' onClick={_onSocialClick}>
              <SocialTwitter a11yTitle='Share on Twitter' />
            </a>
          </Box>
          <Box pad={{horizontal: 'small'}}>
            <a className='addthis_button_linkedin'
              href='#' title='Linkedin' onClick={_onSocialClick}>
              <SocialLinkedin a11yTitle='Share on Linkedin' />
            </a>
          </Box>
          <Box pad={{horizontal: 'small'}}>
            <a className='addthis_button_reddit'
              href='#' title='Reddit' onClick={_onSocialClick}>
              <SocialReddit a11yTitle='Share on Reddit' />
            </a>
          </Box>
        </Box>
      </div>
    </Box>
  );
}

function _highlightCode () {
  var nodes = document.querySelectorAll('pre code');
  for (var i = 0; i < nodes.length; i++) {
    hljs.highlightBlock(nodes[i]);
  }
}

function _updateNodes (post, preview) {
  _highlightCode();

  if (window.addthis && !preview) {
    let target = (
      `http://blog.grommet.io/${post.id}`
    );
    if (window.addthis_share) {
      window.addthis_share.url = target;
      window.addthis_share.title = post.title;
    }
    window.addthis.toolbox('.addthis_toolbox');
  }
}

export default class PostBody extends Component {

  componentDidMount () {
    const { post, preview } = this.props;
    _updateNodes(post, preview);
  }

  componentDidUpdate () {
    const { post, preview } = this.props;
    _updateNodes(post, preview);
  }

  render () {
    const { post, preview } = this.props;
    let htmlContent = {
      __html: marked(post.content || 'POST_CONTENT')
    };

    return (
      <div>
        {_renderPostHeader(post, preview)}
        <Box pad={{ horizontal: 'large', vertical: 'small' }}
          align="center" justify="center"
          className='markdown__container'>
          <div dangerouslySetInnerHTML={htmlContent} />
        </Box>
      </div>
    );
  }
};

export default PostBody;
