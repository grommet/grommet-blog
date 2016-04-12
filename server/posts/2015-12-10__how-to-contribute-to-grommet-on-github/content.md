Grommet was built as a fully open-source project and in the spirit of openness, it is currently hosted on GitHub. For those unfamiliar with GitHub, it is the world's largest open-source community and a powerful tool for collaboration.

We want Grommet to grow and improve with the help of our community. There is a learning curve to get up to speed with the GitHub workflow and we don't want that to be a barrier for you in sharing your valuable contributions. By following the steps in this post, we hope you will understand everything that is required to make your first contribution to Grommet.

Steps:

1. **Create a GitHub account if you don’t have one**: Head to https://github.com/join and fill out the form with your account details.

2. **Fork Grommet into your personal account**: Creating a fork is a way to produce a copy of someone else’s project. All your contributions should be done in your local fork. When you feel your contribution is finished, you need to send a Pull Request. Head to https://github.com/grommet/grommet and click the fork button as described in Figure 1.

  ![Figure 1](fork.png)

3. **Clone your forked version of Grommet**: Open a terminal window (or use a Git GUI tool of your choice) and run the following command:

  ```bash
  git clone https://github.com/${username}/grommet.git
  ```

  Replace `${username}` with your Github id.

4. **Install Grommet in your local environment**: Read the [Building Grommet wiki page](https://github.com/grommet/grommet/wiki/Building-Grommet) to learn how to install your fork locally.

5. **Add a change to your fork**: Now that you have successfully installed Grommet, you can add a change in your local fork and push that to your GitHub. We recommend that you create a Git branch before doing any changes in your local fork. It's a good practice to keep your master branch clean as it makes it easier to keep your local fork always in sync with the main Grommet repository. [Check this blog post](https://gun.io/blog/how-to-github-fork-branch-and-pull-request/) if you want to understand more about forking best practices. The general commands you need to execute are described below:

  ```bash
  cd grommet
  git checkout -b ${SHORT_CHANGE_TITLE}
  git add .
  git commit -m "${CHANGE_DESCRIPTION}"
  git push origin ${SHORT_CHANGE_TITLE}
  ```
  Replace `${SHORT_CHANGE_TITLE}` with a clear title of what your change is about. Also, replace `${CHANGE_DESCRIPTION}` with more descriptive information about the contribution.

6. **Create a Pull Request**: As soon as your branch is pushed from your local branch to your GitHub fork, you will be able to see a "Compare & Pull Request" button as shown in Figure 2.

  ![Figure 2](compare_and_pr.png)

  We have provided some [helpful guidelines for contributing to Grommet](https://github.com/grommet/grommet/blob/master/CONTRIBUTING.md), so please make sure to check those out before making a Pull Request.

7. **Wait for feedback**: After your Pull Request is submitted, a member of the core Grommet team will review your contribution. If everything looks great, it will be merged with Grommet and your legend will grow.It's possible the Grommet team member reviewing your Pull Request will have feedback and ask that you make some changes. We'll cover that scenario in a separate blog post in the near future. We hope you find the information here useful. Please leave comment if you have any questions!