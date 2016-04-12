As many of you know, technologists are an opinionated bunch and debates on topics like which JavaScript framework is king are never-ending. With that in mind, the rationale I’m about to share describes why we chose to use React in early 2015 over Angular for building Grommet.  I understand I won’t convince everyone. In fact, I’m sure this will cause all sorts of religious reactions. I’m expecting replies countering each point I make with pointers to blogs disproving assertions (yes, I’ve read most of those blogs). The bottom line is we continue to see strong adoption of Grommet based on the React model, and our adopters are providing feedback that affirms the benefits described below.

With that said, we chose React because of the following benefits.  While conducting our investigation, we relied on the experiences and feedback of other adopters. As such, I’ve noted which company pointed out the benefits during our evaluation.  Since our adoption, many other companies have started using React.

* **Declarative**: Probably the biggest benefit we’ve seen with React is the declarative nature that allows developers to declare the structure and behavior of each component.  As state changes, it’s handled with events and the code to render the component is written once.  This has tremendous benefits in simplifying development and increasing quality. The Virtual DOM is a key enabler of this capability.  ([Yahoo!](http://yahooeng.tumblr.com/post/101682875656/evolving-yahoo-mail), [BBC](http://www.bbc.co.uk/blogs/internet/entries/47a96d23-ae04-444e-808f-678e6809765d), [Atlassian HipChat](https://developer.atlassian.com/blog/2015/02/rebuilding-hipchat-with-react/))

* **Simplicity**: The model is simple; when components are created, they are self-contained and interaction with the components is through a simple interface using properties and states. Once developers start “thinking React” it dramatically simplifies applications. It also makes applications easy to debug because there is a predictable flow of data when data always flows in one direction. ([Atlassian HipChat](https://developer.atlassian.com/blog/2015/02/rebuilding-hipchat-with-react/), [Netflix](http://techblog.netflix.com/2015/01/netflix-likes-react.html))

* **Isomorphic**: The ability to run the same JavaScript code on both the client and the server allows for both a fast initial page load from the server and a great experience on the client. It’s the best of both worlds and not possible in many web frameworks. ([BBC](http://www.bbc.co.uk/blogs/internet/entries/47a96d23-ae04-444e-808f-678e6809765d))

* **Small**: It does just enough to develop enterprise applications but isn’t the kitchen sink.  With recently added support for ES6 and Components, the API has got even smaller. ( [Netflix](http://techblog.netflix.com/2015/01/netflix-likes-react.html), [Atlassian HipChat](https://developer.atlassian.com/blog/2015/02/rebuilding-hipchat-with-react/))

* **Fast**: You can read about various performance comparisons but needless to say React is very fast, even faster than some folks who’ve tried to hand-optimize solutions. ([Netflix](http://techblog.netflix.com/2015/01/netflix-likes-react.html))

* **Testable**: The simple interfaces are easy to test in a headless and automated manner.  ([Atlassian HipChat](https://developer.atlassian.com/blog/2015/02/rebuilding-hipchat-with-react/))

* **Modular**: Using components puts the code (markup and behavior) together in the same module rather than separating technologies (HTML and JavaScript). React takes the modular approach by including everything that’s needed for a module in one file. ([Netflix](http://techblog.netflix.com/2015/01/netflix-likes-react.html))

* **Short learning curve**: Many have found the learning curve to be dramatically shorter for React than other platforms. The code is simpler and the API can be memorized in a single day.  ([Netflix](http://techblog.netflix.com/2015/01/netflix-likes-react.html), [Yahoo!](http://yahooeng.tumblr.com/post/101682875656/evolving-yahoo-mail))

* **Community**: React is the fastest-growing JavaScript platform on GitHub. The Grommet team frequently attends meet-ups in the San Francisco Bay Area and is closely connected to the React community.  ([Yahoo!](http://yahooeng.tumblr.com/post/101682875656/evolving-yahoo-mail))

While we don’t have the React Native project for Grommet going yet, we’re starting soon.  This will allow developers to learn one platform and write applications for the Web, iOS and Android. Compare this to Web, Swift/Objective C and Android/Java.

Having said all this, Angular was the obvious choice when we started our evaluation. However, as we were starting Grommet in early 2015, Angular 2.0 was the hot topic. The [Angular conference in October 2014](http://angularjs.blogspot.com/2014/10/ng-europe-angular-13-and-beyond.html) talked up Angular 2.0 in a big way.  Angular 2.0 was originally targeted for release in October 2015 but still hasn’t released as of January 2016;  it’s now said to be “[really close](https://jaxenter.com/angular-2-is-coming-soon-but-angular-1-is-not-going-anywhere-121678.html).”  As we evaluated Angular, we realized that the rug was going to be pulled out from under us when 2.0 was released.  The Angular community stated publicly that there will be no migration path explored from Angular 1.x to 2.0 until after 2.0 releases. That was a really tough position to put our project and company in when viewed from a macro level. In August of 2015, the Angular team [announced](http://angularjs.blogspot.com/2015/08/angular-1-and-angular-2-coexistence.html) plans to support Angular 1.x and 2.0 in the same application for migration purposes.  However, the migration is far from automated.

Another detracting finding we uncovered in our investigation was the fact that Google itself barely used Angular. At the time of our [evaluation](https://www.quora.com/What-Google-products-make-use-of-AngularJS), Google was using Angular for DoubleClick and YouTube on the PS3…and that was all we could find.  In that case, maybe it makes sense why the Angular community is willing to completely change the core of the platform. They don’t have their entire enterprise to migrate down a new path.  I couldn’t put Grommet or Hewlett Packard Enterprise in that position.

In the end there is no perfect platform.  Grommet provides a solid foundation that is enabling teams to create great enterprise applications.  We are pleased with our decision to adopt React and are excited to continue growing the capabilities of the platform and the community.

### References

* Atlassian HipChat – https://developer.atlassian.com/blog/2015/02/rebuilding-hipchat-with-react/
* Yahoo! Mail – http://yahooeng.tumblr.com/post/101682875656/evolving-yahoo-mail
* Netflix – http://techblog.netflix.com/2015/01/netflix-likes-react.html
* BBC – http://www.bbc.co.uk/blogs/internet/entries/47a96d23-ae04-444e-808f-678e6809765d
* Angular 1 and 2 integration – http://angularjs.blogspot.com/2015/08/angular-1-and-angular-2-coexistence.html
* Angular 2 is coming soon – https://jaxenter.com/angular-2-is-coming-soon-but-angular-1-is-not-going-anywhere-121678.html
* What Google products make use of AngularJS – https://www.quora.com/What-Google-products-make-use-of-AngularJS