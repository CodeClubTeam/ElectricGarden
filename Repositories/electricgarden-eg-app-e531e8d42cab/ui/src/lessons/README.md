# Lesson Platform

**Please read [Overview](./Overview.md) first!**

## Machine set up

Install

-   [Nodejs](https://nodejs.org/en/) recommend the LTS version
-   [Fork](https://fork.dev) or Source Tree if prefer
-   [Git](https://git-scm.com)
-   [Git-lfs](https://git-lfs.github.com)
-   [Yarn](https://yarnpkg.com/en/)
-   Some sort of Markdown editor. I use [Visual Studio Code](https://code.visualstudio.com)

## Setting up

-   Grant access to bitbucket app repo
-   Open commandline and change to folder where you want it
-   Clone app repo git `git clone git@bitbucket.org:electricgarden/eg-app.git`
-   Commandline into it `cd eg-app` then
    -   `git lfs install`
    -   `yarn install`
-   Checkout lesson-content branch
    -   `git checkout lesson-content`

## Secret `.env` files

To connect to our cloud environments you need some secret keys
which we can't put in source control (because they're secret!).

Obtain the `.env` files from one of the devs for each of the following folders:

-   `./ui`
-   `./api/funcs/http`

### Desktop shortcuts

Shortcuts to make it quick to get going.

By "within" I mean set working directory to that folder.

1. Set up desktop shortcut to `yarn start` within `api/funcs/http` folder
2. Set up desktop shortcut to `yarn start` within `api/ui` folder
3. Set up desktop shortcut for commandline in `api/ui` folder

**When authoring, launch each of those in order.**

### Developing

Whenever you add a new lesson or section or rename them the database needs updating.
Keep that commandline from #3 above and go `yarn lessons` to update.

`git push` to push changes up but to see them on [dev](https://developmentapp.myelectricgarden.nz)
you need to merge them to `develop` branch using bitbucket. Anything in `develop` is automatically
deployed to dev.
