This month we chatted with Lee Byron from Facebook about React and the product infrastructure team he is apart of. In addition to React, he’s worked on open source projects including GraphQL and Immutable.js. He’s also a prolific speaker and you can check out his latest talk from the [Render 2016 conference here](https://vimeo.com/album/3953264/video/166790294 "Render 2016 conference").

<img  src="https://blog.grommet.io/api/post/img/server/posts/2016-06-09__interview-with-lee-bryon-react-developer-at-facebook/images/leebryon.jpg" width="250">
Source: Twitter.com/leeb

Lee was kind enough to answer a few questions about React that we sent his way. Take a look at what he had to say below.

## What’s your background with React?
 
I was part of designing and building the early versions of React, and designed the component lifecycle API. I also contributed to the early versions of ComponentKit, a UI library for iOS based largely on the architecture of React. I've continued to be part of the React community, speaking at conferences and meetups about React and continuing to investigate solving problems related to React like immutable data stores and syncing information from servers.
 
## What do you wish you knew about React before you started using it?
 
When I first started using an early version of React, I thought for sure that it would be very slow. Conceptually whenever anything changes, React re-renders the entire view. However what convinced me was getting a better understanding of exactly what it is that React is doing when reconciling a new representation of a view with the old in order to keep the actual UI up to date. It is often described as first creating a new representation of a view and then diffing this with the old representation. In reality, it actually skips straight to computing a diff which allows for some dramatic speed improvements in the common case: nothing changed.
 
## What tips would you give someone who is just now dipping their toes in React?
 
I would recommend against using any of the "bootstrap" projects or introducing any other new libraries at the same time. React is often only one part of an application's architecture, and there are a lot of other libraries out there that work nicely with it, like Babel, Redux, hot-loading, and Flow. Often newcomers find a blog post or "bootstrap" project which tries to force way too much of this on them simultaneously. My advice is to first introduce React and nothing more into your tool belt and start building your UI components. Once you have a good understanding of how and why React does what it does, then you can start introducing more tools.
 
## Do you think React was a good choice for Grommet? Why?
 
In essence, Grommet is a library of reusable UI components. Components are often difficult to build in HTML-template-based UI libraries or even traditional MVC libraries because the elements of composition are not granular enough to represent small reusable elements. React's essential building block is the Component, which is exactly what you want for reusable UI elements. React was originally designed for exactly this kind of use and was inspired by XHP - an extension to PHP to allow for Component based static UIs - which defined Facebook's UIs including it's reusable UI elements for many years before React was introduced.
 
## What has surprised you about the adoption of React?
 
When React was first pitched internally at Facebook, it faced a lot of opposition because of an intuition that it would be slow, and performance is an important topic at Facebook. The project persevered and when it was clear that intuition was misguided, React started to be adopted by many teams at Facebook. When React was initially open sourced in 2012, it faced immediate negative reaction, mostly due to JSX - an optional syntax addition to JavaScript that makes writing component data structures more legible. We figured that React would be relegated to the sidelines in the open source community as most believed that this coupling of business logic and display logic was a bad idea. 

What's been surprising is just how quickly that perspective changed as many started trying out React for themselves. They found that their front-end business logic and their display logic actually benefited from the cohesion React provided. 

We had no idea how popular React would become, and are humbled and thrilled to see React in use on many major websites and now in many major applications via React Native, ComponentKit, and other libraries which share React's architecture.
 
## Where do you see React a few years from now?
 
React itself is largely complete and most of it's evolution is in better understanding the underlying operating mechanisms, and generalizing them further. More recently that line of work has allowed React to actually be completely uncoupled from the web browser. You actually need to also include ReactDOM in order to use React in a browser. React can target any kind of retained-mode UI framework including essentially all popular native application UI frameworks including iOS, Android, and Windows. Future work is trying to divorce React from CSS style sheets by providing more functional layout mechanisms (inspired by ComponentKit) and to allow React's operating mechanisms to be more asynchronous to better support environments which support threads (such as iOS and Android) and to ensure that UIs never stutter or freeze, even when doing complex updates.
