Let me start by saying that the definition of CSS in JavaScript is rather unclear to me at this point. Is that really only about writing CSS as JavaScript objects? How about inline styles? How about local styles?

I define _CSS in JavaScript_ as **using JavaScript to enhance CSS capabilities**. There are many platforms emerging which aim to address this goal: [CSS Modules](https://github.com/css-modules/css-modules), [PostCSS](https://github.com/postcss/postcss), CSS-in-JS (e.g [Aphrodite](https://github.com/Khan/aphrodite), [csjs](https://github.com/rtsao/csjs)).

Cool, now that we have defined _CSS in JavaScript_, let me explain why I'm writing this post. My name is Alan Souza and I work on [Grommet](https://github.com/grommet/grommet), an open-source UX framework based on [ReactJS](https://github.com/facebook/react). Currently our styles live outside our components and we use SASS as a pre-processor. Recently, we started receiving [requests](https://github.com/grommet/grommet/issues/567) to add support for CSS Modules. I decided to investigate the existing tools for a better styling architecture. This blog post aims to describe my journey as someone coming from a SASS background trying to replace it by the best possible framework for CSS in JavaScript.

> I have to warn you: it was a long journey. TLDR; :smile: 

Ultimately the Grommet community is seeking self-contained components with styles local by default so that they can instantiate a component and not worry about anything else. So the ideal Grommet app would look like this:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import Anchor from 'grommet/components/Anchor';
import Grommet from 'grommet/components/Grommet';

const Main = () => {
  return (
    <Grommet>
      <Anchor href="http://google.com">Child text</Anchor>
    </Grommet>
  );
};

const element = document.getElementById('content');
ReactDOM.render(React.createElement(Main), element);
```

Where the Anchor and Grommet components would responsible for styling themselves. Currently, the Grommet guideline is to import the SASS at the top of your main JavaScript file:

```css
import 'grommet/scss/vanilla/index.scss';
// or import 'grommet/scss/hpe/index.scss'
```

Then our users rely on a bundling tool such as Webpack or Browserify to load the files and include them in their production build, either inside the JavaScript bundle itself or as an external css file. There are other ways to do this, but this is what most of our Grommet apps are doing today.

I started my journey reading a very motivating and well-written [article](http://glenmaddern.com/articles/css-modules) by [Glen Maddern](https://github.com/geelen) about CSS Modules. I really enjoyed how he compares the traditional SASS + BEM approach with CSS Modules. :clap: 

## CSS Modules investigation

I was so excited that I decided to create a [branch](https://github.com/grommet/grommet/tree/css-modules) in Grommet for the CSS Modules investigation.

I chose to start with CSS modules because it is almost raw CSS with a tiny layer of JavaScript to convert the global styles to local styles (hash based). With that I don't feel I'm locked-in to a JavaScript-based framework with a structure that would be hard to move back to CSS in the future as the CSS standard evolves, and we know it will. Even with SASS, we don't feel it would be difficult for Grommet to move away from.

In my branch, I decided to start with the Anchor component.  The [CSS files](https://github.com/grommet/grommet/tree/css-modules/src/js/styles) in Grommet currently look like this:


```css
/* colors.css */
.linkColor {
  color: #720;
}

/* anchor.css */
.common {
  color: linkColor from '../shared/colors.css';
  cursor: pointer;
  ...
}

...
```

and here's the [Anchor](https://github.com/grommet/grommet/blob/css-modules/src/js/components/Anchor.js) component: 

```javascript
/* Anchor.js */
import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './anchor.css';

export default class Anchor extends Component {
  render() {
    const { children, disabled, hasIcon, href } = this.props;
    const classes = classnames(
      styles.common,
      {
        [styles.disabled]: disabled,
        [styles.hasIcon]: hasIcon
      }
    );
    return <a href={props} className={classes}>{props.children}</a>
  }
}
```

Everything was going well until the point I had to introduce a very important feature for a component library like Grommet: **theming**. Unfortunately, Glen's article did not touch on this topic, and to be honest I'm surprised theming is not more prominent in the CSS in JavaScript frameworks. My first challenge was finding a reference on how I could change the `linkColor` that is defined in the base SCSS file.

During my research I found PostCSS and it gave me hopes I could make things work again. CSS Modules and PostCSS are actually pretty connected, you can see a lot of PostCSS plugins inside CSS Modules Github [organization](https://github.com/css-modules?utf8=✓&query=postcss).

Well, during my investigation I found a LOT of postcss plugins for handling variables: [postcss-css-variables](https://github.com/MadLittleMods/postcss-css-variables), [postcss-vars](https://www.npmjs.com/package/postcss-vars), [postcss-nested-vars](https://www.npmjs.com/package/postcss-nested-vars), [postcss-simple-vars](https://github.com/postcss/postcss-simple-vars), [postcss-custom-properties](https://github.com/postcss/postcss-custom-properties), and, last but not least [postcss-modules-values](https://github.com/css-modules/postcss-modules-values). I don't know about you, but I was pretty confused with the range of options to choose from. It is even possible to use multiple at the same time (e.g postcss-modules-values and postcss-simple-vars) :confused: 

At first I tried postcss-modules-values, and I was lucky enough to find an [issue](https://github.com/css-modules/postcss-modules-values/issues/6) opened (it remains opened) about theme support. Some say [css variables](https://www.w3.org/TR/css-variables/) is the future, and I partially agree with that. In my humble opinion, css-variables is not enough. Theming is not only about **replacing variables**, complex theming involves also the ability to add new css atributes to existing components. We can achieve that with SASS/CSS today pretty easily as the styles are global. For example:

```scss
/* button.scss */

$button-text-color: #333 !default;

.grommetux-button {
  text-align: center;
  outline: none;
  color: $button-text-color;
  ...
}


/* themes/hpe.scss */

$button-text-color: #01a982;

@import '../button';

.grommetux-button:hover {
  box-shadow: 0px 0px 0px 2px #01a982;
}

```

We want to add a box-shadow property only in the HPE theme. What if we add a variable to support that case? Yes, it solves this problem, but it is nearly impossible to map all the different properties a component can have, not without bloating your library with variables for the different components you provide. This very simple SASS code seems like impossible to achieve with CSS Modules + PostCSS.

But I tried, I submitted issues and pull requests to postcss-simple-vars to try and achieve what I needed.

https://github.com/postcss/postcss-simple-vars/issues/57
https://github.com/postcss/postcss-simple-vars/pull/58
https://github.com/postcss/postcss/issues/849

After some back and forth with [Andrey Sitnik](https://github.com/ai), the creator of PostCSS, he recommended the following:

> @alansouzati honestly, it will be better to use CSS-in-JS for you. I suggest JSS or CSJS. With CSJS you could even use PostCSS plugins (like Stylelint and Autoprefixer) by babel-plugin-csjs-postcss.

This is where my CSS Modules investigation stopped :cry: 

## CSS-in-JS investigation

My journey here started with a great [project](https://github.com/MicheleBertoli/css-in-js) by [Michele Bertoli](https://github.com/MicheleBertoli) where he lists all the available projects for CSS in JavaScript (including css-loader for CSS Modules!). By the time I wrote this article I counted 41 options to choose from. If I was confused before by the different postcss variables plugins, imagine how I felt now.

![](http://i.giphy.com/3o6ZsW8eFwJbgpaMw0.gif)

The simplicity of [CSJS](https://github.com/rtsao/csjs) by [Ryan Tsao](https://github.com/rtsao) really got my attention. I really like the fact that he is using ES6 template strings to make things dynamic.  Pretty smart. There it is goes, me excited again...

![](http://i.imgur.com/N8TxB76.gif)

I created another [branch](https://github.com/grommet/grommet/tree/csjs) in Grommet for my CSJS investigation. :tada: 

The anchor [style](https://github.com/grommet/grommet/blob/csjs/src/js/styles/anchor.js) now looks like this:

```javascript
/* style.js */

import csjs from 'csjs';

import colors from './base/colors';

export default (theme = {}) => {
  const styles = Object.assign(
    {...colors},
    theme.base
  );

  return csjs`
    .common {
      color: inherit;
      text-decoration: ${styles.linkTextDecoration};
      cursor: pointer;
    }

    ...

    ${theme.anchor || ''}
  `;
};

module.exports = exports.default;

```

Notice the .js file extension. At least now we are able to extend the Anchor base styles with the extra content from the `theme.anchor` property, which is good, but there is no CSS anymore: it is all in JavaScript.

Our new Anchor [component](https://github.com/grommet/grommet/blob/csjs/src/js/components/Anchor.js) is pretty similar to the CSS Modules component:

```javascript
/* Anchor.js */
import React, { Component } from 'react';
import classnames from 'classnames';
import anchor from './style.js';

export default class Anchor extends Component {
  render() {
    const { children, disabled, hasIcon, href } = this.props;
	
    const styles = anchor(this.context.theme);
	
    const classes = classnames(
      styles.common,
      {
        [styles.disabled]: disabled,
        [styles.hasIcon]: hasIcon
      }
    );
    return <a href={props} className={classes}>{props.children}</a>
  }
}

Anchor.contextTypes = {
  theme: React.PropTypes.object
};
```

Here we are using React context to set the current theme so that you can do:

```javascript
import hpeTheme from 'grommet-hpe-theme';

<Grommet theme={hpeTheme()}>
  <Anchor href="http://google.com">Child text</Anchor>
</Grommet>
```

I've created [grommet-simple](https://github.com/grommet/grommet-simple) that uses this Grommet branch, so feel free  to tinker with it. Your feedback is gladly appreciated.

Well, this is definitely closer to what we currently have today with SASS, but that are few lingering issues we were not able to overcome.

## Conclusion

When it comes to CSS in JavaScript, theming still seems like a challenge in general. If themable components are not a requirement for your project, CSS Modules + PostCSS seems awesome.

For component libraries like Grommet, CSS-in-JS can overcome the challenges presented with CSS Modules but I see some drawbacks:

### Abandoning a language designed for styles

Check out this great blog [post](http://keithjgrant.com/posts/against-css-in-js.html) by [Keith Grant](https://twitter.com/keithjgrant) where he writes about why he is against CSS-in-JS.

I like when he says:

> The relationship between CSS and JavaScript is not like the relationship between HTML and JavaScript.

That's one of the reasons he believes we should not merge CSS and JavaScript together.

### Caching and server side rendering is harder

See this great [thread](https://github.com/kentcdodds/ama/issues/132) about CSS-in-JS.

As content lives inside the `<style></style>` tag for most of these libraries, caching seems like a challenge that I'm not sure there is a solution yet. [Aphrodite](https://github.com/Khan/aphrodite) seems to be more flexible around this topic with support to what they call as rehydrate (is this really a word? :smile:). With that it is possible to render the styles in the server that helps with performance. Unfortunately I did not have time to play with Aphrodite.

### Poor Tooling

Some people say that they don't care about linting/debugging in CSS anymore, but we do! With CSS in JavaScript linting and debugging is a known [limitation](https://github.com/kentcdodds/ama/issues/132#issuecomment-221974224) and there is not a lot of tools available out there to help us. 

In Grommet, we need to be more cautious about these decisions as it can affect a lot of existing projects that are consuming our components. We feel CSS in JavaScript is unproven in large, themeable component libraries and we are not convinced that we should move to this pattern just yet. For this reason, our current architecture with SASS + BEM remains in place. We are happy to hear more and engage with the community as CSS in JavaScript evolves.

