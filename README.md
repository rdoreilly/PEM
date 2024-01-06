Personality Emotion Mapping (PEM) Model

**React.js** project designed as part of an online platform that enables students to participate in multi-modal surveys.

This is written in JavaScript with Firebase used for much of the backend functionality including data storage, authentication, and hosting. To view the live version, see [https://academicsurvey.ie/](https://academicsurvey.ie/)

**Currently running on**
* React v16.12.0
* Firebase v7.8.1


### Helpful Guides:
* [Intro to React](https://reactjs.org/tutorial/tutorial.html)
* [React Deployments](https://create-react-app.dev/docs/deployment/)
* [Understanding Firebase Projects](https://firebase.google.com/docs/projects/learn-more)
* [Firebase Authentication](https://firebase.google.com/docs/auth)
* [Cloud Firestore](https://firebase.google.com/docs/firestore)
* [Firebase Hosting](https://firebase.google.com/docs/hosting)
* [Firebase Security Rules](https://firebase.google.com/docs/rules)


### Building
There are a number of IDEs that you can choose from but I'd highly recommend Visual Studio Code. It's widely used, well-documented, and has a large selection of useful plugins and tools.

To run this locally, simply use the command `npm start`. This should start the project and open it in your default web browser on `http://localhost:3000/`

In order to build and deploy the web app, you need to first run `npm run build`.
After this, you can run `firebase deploy` and this should create a new deployment once your environment is set up correctly. Please see the documentation on [React Deployments](https://create-react-app.dev/docs/deployment/) and [Firebase Hosting](https://firebase.google.com/docs/hosting) for an in-depth guide.


### Goal-Setting Group Assignment & Redirect
As of the time of writing (May 2022), all new sign-ups are assigned to either the goal-setting or control group. This will have no affect on any studies currently. It will not interfere or limit which studies can be carried out unless you change code to make it do so.

This was done to allow automatic group assignment to be carried out and to redirect participants to the correct quiz based on their group. To enable this redirect, see `fetchGroup()` and the commented out code in `render()` in `HomeContent.js`. Make sure to change the routes in `fetchGroup()` to match the new URLs for the studies which you intend on redirect the participants to.


### Recording Participants' Webcams
A previous study required the use of participants' webcams for the duration of the study. This was not required in all situations so it was disabled. If you wish to re-enable it, there are a number of commented out sections of code in `BlockContent.js`, `GroupContent.js` and `QuizContent.js`.


### Important
Please make sure to thoroughly test out any surveys/quizzes that you make before sending them out. There have been a number of issues that have previously popped up when testing that may have never been noticed. These might be small or else they may end up breaking an entire section of your study.
