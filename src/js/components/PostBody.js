import React, {Component} from 'react';
import { Link } from 'react-router';
import fecha from 'fecha';

import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Footer from 'grommet/components/Footer';
import Tags from 'grommet/components/Tags';
import Tag from 'grommet/components/Tag';
import Markdown from 'grommet/components/Markdown';

import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';
import SocialLinkedin from 'grommet/components/icons/base/SocialLinkedin';
import SocialReddit from 'grommet/components/icons/base/SocialReddit';

import history from '../RouteHistory';

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

function _onSocialClick (event) {
  event.preventDefault();
}

function _onArchiveTag (tag, event) {
  event.preventDefault();
  history.push(`/archive/tag/${tag}`);
}

function _renderPostHeader (post, preview) {
  const createdAtDate = post.createdAt ?
    new Date(post.createdAt): new Date();
  let day = fecha.format(createdAtDate, 'DD');
  let month = fecha.format(createdAtDate, 'MM');
  let year = fecha.format(createdAtDate, 'YYYY');
  let formattedDate = fecha.format(
    createdAtDate, 'MMMM D, YYYY'
  );

  const author = post.author || 'AUTHOR_NAME';
  let formattedAuthor = (
    author.replace(' ', '').toLowerCase()
  );

  let target = (
    `http://blog.grommet.io/post/${post.id || ''}`
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
      <Heading tag='h3' strong={true} align='center'>
        Posted {formattedDate} by {author}
      </Heading>
    );
  } else {
    secondaryHeader = (
      <Heading tag='h3' strong={true}>
        Posted <Link to={`/archive/${year}/${month}/${day}`}>
          {formattedDate}
        </Link> by <Link to={`/archive/author/${formattedAuthor}`}>
          {author}
        </Link>
      </Heading>
    );
  }
  return (
    <Box pad='large' colorIndex='neutral-2' {...backgroundOptions}
      align='center' justify='center'>
      <Heading align='center' strong={true}>
        {post.title || 'POST_TITLE'}
      </Heading>
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
      `http://blog.grommet.io/post/${post.id}`
    );
    if (window.addthis_share) {
      window.addthis_share.url = target;
      window.addthis_share.title = post.title;
    }
    window.addthis.toolbox('.addthis_toolbox');
  }
}

function _renderTags (tags, preview) {
  let tagsNode = tags.split(', ').map(
    (tag, index) => {
      let handlers = {};
      if (!preview) {
        handlers.onClick = _onArchiveTag.bind(this, tag);
        handlers.href= `/archive/tag/${tag}`;
      }
      return (
        <Tag key={index} label={tag}
          {...handlers} />
      );
    }
  );
  return (
    <Footer pad='large' direction='column' justify='center' align='center'>
      <h3>Tags:</h3>
      <Tags pad={{horizontal: 'small'}}>
        {tagsNode}
      </Tags>
    </Footer>
  );
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

    let footerNode;
    if (post.tags) {
      footerNode = _renderTags(post.tags, preview);
    }

    let components = {
      p: {
        props: {
          size: 'large'
        }
      },
      a: {
        props: {
          target: '_blank',
          onClick: function (event) {
            if (preview) {
              event.preventDefault();
              console.warn('No actions allowed in preview mode');
            } else {
              const href = event.currentTarget.getAttribute("href");
              if (!/^(http|https):\/\//.exec(href)) {
                event.preventDefault();
                history.push(href);
              }
            }
          }
        }
      },
      img: {
        props: {
          size: 'medium'
        }
      },
      h3: {
        props: {
          strong: true
        }
      }
    };

    return (
      <div>
        {_renderPostHeader(post, preview)}
        <Box pad={{ horizontal: 'large', vertical: 'small' }}
          align='center' justify='center'>
          <Box className='post-body'>
            <Markdown content={post.content || 'POST_CONTENT'}
              components={components} />
          </Box>
        </Box>
        {footerNode}
      </div>
    );
  }
};

export default PostBody;
