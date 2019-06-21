# Scrivnr

Scrivnr is a WebRTC-based voice-call application that also records audio and 
saves a transcription (created using Google Speech-to-text) of the conversation which can then be reviewed by the users that participated.

This repository contains both front-end (ReactJS app) and back-end (Express server) code.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.




### Prerequisites

You will require the following to build and serve the application

```
node.js
yarn
create-react-app cli
```

### Installing

A step by step series of examples that tell you how to get a development env running (after forking & cloning)

- Set up Firebase instance with Tables as follows
 - Users & Authentication
 - Empty "contacts" array for each user
- Set up your own Firebase credentials in src/config/fbConfig.js
```
  apiKey:'xxx',
  authDomain: "yyy.firebaseapp.com",
  databaseURL: "https://yyy.firebaseio.com",
  projectId: "yyy",
  storageBucket: "yyy.appspot.com",
  messagingSenderId: "12345",
  appId: "1:1234567:web:abc123"
```
- If you don't have one, create an account with Google Cloud Platform (GCP), download your JSON file credentials and set them up on your machine. For directions, please check the GCP site. (Note: Call functionality will still work without GCP)
- Build react app production build (Note: Please use yarn to manage dependencies.)
```
yarn build
``` 
- Start the server
```
yarn start
``` 
- Access the site
```
https://<YOUR_IP>:9000
```
- If you want to use hot reloading while working on the React App, it will likely be served on port 3000 so you will need to adjust the path for the signaling server. In src/components/contacts/ContactList.js :
Change
```
const tempSocket = io.connect();
```
to
```
const tempSocket = io.connect("<YOUR_SOCKET_SERVER>");
```
- Sign up and create a few users, then use Contact List functionality to add.


## Running the tests

Currently there are no automated tests created for Scrivnr. Please check out our CONTRIBUTE.md and help out!

### End to end tests

Calling and transcription features were tested by hand

### And coding style tests

Currently, no coding style tests exist

## Deployment

Scrivnr has been successfully deployed to heroku at https://scrivnr-react.herokuapp.com/
The following things are required for successful 

Environment variables
```
ISHEROKU=yes // This will con

```

## Built With

* [React](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [yarn](https://maven.apache.org/) - Dependency Management
* [AAA](https://AAA.com/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning


We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Creators

- [KyeongHun Min](http://www.github.com/sziru)
- [Thomas Henderson](http://www.github.com/thenderson55)
- [Ian Cameron](http://www.github.com/iankameron)

## License

This project is licensed under the MIT License.

## Acknowledgments, other

* This is a senior project created over 3 weeks at the Code Chrysalis Immersive Course.
* Inspiration
* etc

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Other
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
