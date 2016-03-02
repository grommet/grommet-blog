import SocialShare from './SocialShare';
import SocialReddit from 'grommet/components/icons/base/SocialReddit';

export default class RedditShare extends SocialShare {
  constructor (props) {
    super(props);

    this.name = 'Reddit';
    this.icon = (
      SocialReddit
    );

    const url = encodeURIComponent(props.target);
    this.url = `https://www.reddit.com/submit?url=${url}`;
  }
};
