# Lesson Platform Overview

Relatively concise run through of the Lesson Platform for content authors.

# Core Aims

-   Support rich re-usable Interactive Activities:
    -   Able to use real and fake Electric Garden data
    -   Able to use exact visuals used in the website (e.g. chart)
-   Lesson content broken into completable sections (activities may determine completion)
-   Authored lessons should be easily styled in a consistent way (ideally automated)
-   Students should have access to lessons automatically managed e.g.
    -   Learner level on learner and student
    -   Pre-requisites via micro-credentials (gamification/badges). _not yet implemented_

# Non-constraints

Unlike a web shop we don't need a CMS.
This is because our content authoring is internal.
The assumption is that content authors can use tools like git and JSX and if they get stuck they have access to technical folk who can help them out.

The priority is to be able to support the core aims.

An off-the-shelf CMS would not support the rich activity integration and learning management features we need.

# Implementation

## Content Language

Markdown is a simple plain text based language that allows basic semantic mark-up
such as headers.

It can be transformed to html and styled with CSS separately from the content.

The lack of support for rich formatting and layout is a feature rather than a downside:

-   It ensures consistency in layout and formatting.
-   Content authors can focus on the content itself rather than how it looks.

## Rich Activity Support

We are using an extension to Markdown called `MDX` which allows hosting
of JavaScript with JSX (`react`) components.

This feature allows Interactive Activities to be placed and configured directly in the content.

It also means Interactive Activities can be implemented in the same tooling as the web application
so we can use the application components (such as chart) inline and access the live data.
It also means developers who can work on the website can also work on Interactive Activities.

## Metadata

We provide a header section at the top of each document where metadata can be provided:

This includes the following:

| name           | purpose                                        | example             |
| -------------- | ---------------------------------------------- | ------------------- |
| name           | unique identifier for whole lesson             | learn-to-code       |
| title          | title of lesson                                | Learn to Code       |
| level          | learner level                                  | 3                   |
| ordinal        | ordering relative to other lessons             | 4                   |
| locked         | whether to show on site as locked              | false               |
| publish        | whether to show on site at all                 | true                |
| coverImagePath | relative path to cover image for Projects page | `./codebanner2.png` |

Additional notes:

-   `name` needs to be unique and stable (it's an id but it shows in browser location bar). Once a lesson is published, if the name changes, then students who have fully or partially completed that lesson will be deemed as having never started it. _Try to have it match the filename too._
-   `title` shows at the top of the page when in the lesson so should be meaningful
-   `level` determines whether a lesson shows up at all. If a student has a learner level set to less than this number, the lesson will not show up for
    them at all in the Projects page.
-   `locked` vs `publish`. Locked is really to tease about future in progress lessons without making them available.
-   Before marking a lesson as published (`publish`: `true`), make sure you are happy with the `name` and all the section titles (heading level two `##`).

## Lesson Content

In the content you can use standard mark-down.

For editors there are plain text editors (I use Visual Studio Code which has built in Markdown Preview) and WYSIWIG editors.

See [https://ghost.org/blog/markdown/](https://ghost.org/blog/markdown/) for an in depth guide including a list of editors.

However there are some aspects that we treat as special.

### Lesson Sections

Lessons (projects) are broken up into Sections (separate pages).

Each Section is **completable**. This means:

-   When the learner clicks the Next button at the bottom the section is marked as completed. The progress bar on the Projects page is updated and next time they return to this Project it will jump straight to the first incomplete section.
-   Interactive Activities in a Section are "asked" if they are completed. Only if all Interactive Activities answer "yes" will the Next button be "lit up". So for example, a multi-choice Interactive Activity might insist on the "right answer" having been chosen.

Sections are split up on heading level two (`##`) so these headings are effectively Section Titles. It is important you give these heading levels a reasonable and unique title (see below for why unique).

### Section Headings

Section Headings are used to generate the Section Name (identifier). This needs to be:

-   unique within the lesson
-   stable (once published) as this identifier is used to track student completions. If it is changed, all students who have partially completed a lesson will be deemed to have not completed that section.

To assist with this we have a `slugify` script which "locks in" the Section Name by adding the name inside the content. This allows you to change the title without changing the name.

In the example below "Scratch" is the section title and "scratch" is the stable fixed name. If the `{#scratch}` part wasn't there it would be generated on the fly from th title. the `slugify` script just locks this in for all published lessons.

`## Scratch {#scratch}`
