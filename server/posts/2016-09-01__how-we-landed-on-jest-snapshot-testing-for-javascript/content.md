Well, choosing a framework for unit testing in JavaScript today is quite a challenge. With so many options to choose from, sometimes it is hard to make a decision. This article is going to explain the reasoning why we chose Jest as our framework for testing our super awesome React-based UX framework [Grommet](https://github.com/grommet/grommet). :stuck_out_tongue_winking_eye: 

Back in the days our tests looked like this:

```javascript
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var expect = require('expect');
var assert = require('assert');
var sinon = require('sinon');

var Anchor = require('../../src/js/components/Anchor');

var jsdom = require('jsdom-no-contextify').jsdom;
global.document = jsdom('<html><body></body></html>');
global.window = document.defaultView;
global.navigator = {
  userAgent: 'node.js'
};
  
describe('Grommet Anchor', function() {
  it('loads a basic Anchor', function() {
    var onAnchorClick = sinon.spy();
    var Component = TestUtils.renderIntoDocument(
      <Anchor href="http://google.com" onClick={onAnchorClick}>
        Test
      </Anchor>
    );
    
    var instance = TestUtils.findRenderedDOMComponentWithClass(
      Component, 'anchor'
    );

    expect(instance).toExist();
    assert.equal(instance.getDOMNode().textContent, 'Test');
	
    TestUtils.Simulate.click(instance.getDOMNode());
    assert(onAnchorClick.calledOnce);
	
  });

  // trust me, more tests here...
});
```

Let me explain what is going on here. We are using React with addons to grab the `TestUtils` (I believe today this is a separate module). For assertions we are using `expect` and `assert` libraries. To mock data and functions we are using `sinon`. The `TestUtils.renderIntoDocument` function expects a virtual DOM to be available in the global context, so we are using `jsdom-no-contextify`. You can use `jsdom` today, but in the past the contextify dependency had issues with [installation](https://github.com/tmpvar/jsdom/issues/378), anyone else? Then we get to the `describe` and `it` functions, which should be familiar to you if you ever used a test runner before. To execute a test you need a runner, you are not even seeing it here but we were using [Mocha](https://mochajs.org). There is something else that you are not seeing here that is also useful to mention, we used [Istanbul](https://github.com/gotwarlost/istanbul) to collect code coverage.

Let's summarize the dependencies required to run a simple Anchor test: TestUtils, expect, assert, sinon, jsdom, mocha, and instanbul. It took me a while before I was able to run my first test after spending some time learning the required configuration for this to work as expected.

After this we started adding more component tests and we eventually got to a 80+% coverage. Honestly, I regret not starting with proper tests in the first day, but you know, it happens. It took us a considerable amount of time to configure the assertions right to make sure we were testing a component in a good way. After all, we were not only interested on a good code coverage, but also a good **set of assertions**.

Then, we started facing performance issues and limitations with the JSDOM library. We then decided to refactor our tests and used [shallow renderer](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering) to avoid a virtual DOM. This is how our Anchor test looked until a few weeks ago:

```javascript
import {test} from 'tape';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';

test('loads a basic Anchor', (t) => {
  t.plan(3);
  const onAnchorClick = sinon.spy();
  const shallowRenderer = TestUtils.createRenderer();
  shallowRenderer.render(React.createElement(Anchor, { 
    href: 'http://google.com',
    onClick: onAnchorClick
  }));
  const anchorElement = shallowRenderer.getRenderOutput();

  if (anchorElement.props.className.indexOf('anchor') > -1) {
    t.pass('Anchor has class');
  } else {
    t.fail('Anchor does not have anchor class');
  }

  t.equal(anchorElement.props.href, 'http://google.com', 'Anchor has test href');
  
  anchorElement.props.onClick();
  t.ok(onAnchorClick.called, 'Anchor click callback was invoked');
});
```

So, let's check how we improved here, not to mention that we upgraded the tests to ES6 :tada:. We moved from Mocha to Tape and with that we don't require `assert` and `expect` since Tape has them built-in. We still need sinon, but we don't need JSDOM anymore. `TestUtils` from React provides a `createRenderer` function where you can mount your component in a shallow environment. We still have to create the assertions, but now they are based on the props, which in our opinion is much better then dealing with the DOM nodes.

We were quite happy with this solution but we started facing issues with code coverage. As we don't have a DOM, the React lifecycle functions were not invoked. It got really hard to adequately exercise our components and get an acceptable level of code coverage.

So we started the investigation again, we looked into [Ava](https://github.com/avajs/ava) and [Jest](https://facebook.github.io/jest/) as test runners and [Enzyme](https://github.com/airbnb/enzyme) as a test utility. We also looked into JSDOM again and we discovered it no longer requires contextify.

Jest really got our attention, mainly for the fact that it looks like a one-stop-shop for unit testing. Jest was on version 14 which introduced one feature that was unique and was the selling point for us: [snapshot testing](https://facebook.github.io/jest/blog/2016/07/27/jest-14.html).

The idea is that you don't need to write the assertions manually, but instead you take a snapshot of a component with a given configuration, like taking a picture. In the future, if anything changes in the snapshot, the test fails. It's up to the developer to inspect the snapshot and decide whether is an expected change or if it is a bug in their code. Jest really got the "zero-configuration" right and it became really easy for us to write a test and get going in literally no time. This is how I would explain Jest snapshot testing in real life:

![](https://i.giphy.com/tytmsBazx7SYE.gif)

As they explain in the Jest 14 release notes, they have limitations with performance and code coverage. But luckily they have a full-time member [Dmitrii Abramov](https://github.com/dmitriiabramov) who refactored a lot of things and my kudos to him for being so responsive with the issues I've faced. Recently they released Jest 15 which meets our needs.  This is how our [Anchor test](https://github.com/grommet/grommet/blob/master/__tests__/components/Anchor-test.js) is today:

```javascript
import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import Anchor from '../../src/js/components/Anchor';

describe('Anchor', () => {
  it('has correct default options', () => {
    const onAnchorClick = jest.fn();
    const component = renderer.create(
      <Anchor href='test' onClick={onAnchorClick} />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
	
    tree.props.onClick();
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(onAnchorClick).toBeCalled();
  });
  
  // trust me, more tests...
});
```

Jest really has everything together: a test runner, assertion, and mocking. Here are the benefits we value with using Jest and its Snapshot strategy:

* **Zero configuration**: the default environment for Jest is jsdom, but all the configuration is managed inside the library. The same goes for coverage, behind the scenes they are using istanbul. They used Jasmine as a test runner in the past, but now they've got their own runner.
* **Less dependencies**: it is really fast to install and learn it. You don't have to spend a lot of time learning and configuring dependencies, it just works.
* **Performance**: it runs tests in parallel to optimize performance. Also, it makes a good use of caching to transform ES6 code, and integrates that well with the coverage report. What you see in the coverage is the ES6 code not the transformed one, again with zero configuration.
* **Fast creation**: we all know that time is always limiting us to write good tests. With snapshots we can get a test running in seconds. Creating assertions manually is time-consuming and we end up not spending enough time writing tests, or worse yet, not writing tests at all.
* **Easier inspection**: the snapshot content is the actual DOM structure. We find it extremely convenient as we can check how our component will render in the browser. We can validate the attached events and make sure the DOM structure is as lean as possible.
* **Great support**: needless to say how responsive the community is. I've faced some issues, reported them, and the maintainers engaged pretty much the same day. In a few days I got all my problems resolved.

We are excited to be using Jest and we hope this post helps you understand why we chose it. Join our Slack channel and engage with the Grommet community: http://slackin.grommet.io.
