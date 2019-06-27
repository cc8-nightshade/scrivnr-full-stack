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
 - "dialogues" and "users" collections in your Firestore database
- Set up your Firebase credentials.
  - Front-end: src/config/fbConfig.js
```
  apiKey:'xxx',
  authDomain: "yyy.firebaseapp.com",
  databaseURL: "https://yyy.firebaseio.com",
  projectId: "yyy",
  storageBucket: "yyy.appspot.com",
  messagingSenderId: "12345",
  appId: "1:1234567:web:abc123"
```
  - Back-end: environment variables (referenced in /server/firebase.js)
```
process.env.API_KEY,
process.env.AUTO_DOMAIN,
process.env.DATABASE_URL,
process.env.PROJECT_ID,
process.env.STORAGE_BUCKET,
process.env.MESSAGING_SENDER_ID,
process.env.API_ID
```
- If you don't have one, create an account with Google Cloud Platform (GCP), download your JSON file credentials and set them up on your machine. For directions, please check the GCP site. (Note: Call functionality will still work without GCP)
- Build react app production build (Note: Please use yarn to manage dependencies.)
```
yarn build
``` 
- Prepare HTTPS keys
  - If you want to run the server locally and make calls between different machines, it needs to be an HTTPS connection (browsers won't let you share your mic otherwise). Private key and certificates are read by server/index.js when starting the HTTPS version of the server. You can use Open SSL etc for this. Create the following two files in your repository for HTTPS.
```
server/ssl/server.key
server/ssl/server.cert
```
- Start the server
```
yarn start // if there is no "ISHEROKU" environment variable, will start an HTTPS server so you can serve to 
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

## Deployment

Scrivnr has been successfully deployed to heroku at https://cc-scrivnr.herokuapp.com/
The following things are required for successful operation. Also, you need to find a way  

Environment variables
```
ISHEROKU=yes // This will make the server load as HTTP (not HTTPS), but Heroku then sets it up as HTTPS for you.
API_KEY=xxx //Firebase credentials
...
```

## Built With

* [React](https://reactjs.org) - The web framework used
* [yarn](https://yarnpkg.com/) - Dependency Management

## Contributing

Please raise issues in the repository and tag one of the original authors.

## Creators

- [KyeongHun Min](http://www.github.com/sziru)
- [Thomas Henderson](http://www.github.com/thenderson55)
- [Ian Cameron](http://www.github.com/iankameron)

## License

This project is licensed under the MIT License.

## Acknowledgments, other

* This is a senior project created over 3 weeks at the Code Chrysalis Immersive Course.
