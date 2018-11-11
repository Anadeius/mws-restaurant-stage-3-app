# Mobile Web Specialist: Stage 3 Project
---

## Project Overview: Stage 3 

Stage 3 utilized the modified code of Stage 2, which can be found [here](https://github.com/Anadeius/mws-restaurant-stage-2) as a baseline to work off. With this base app and an updated API server which provided additional endpoints for PUT and POST requests, we implemented Reviews and Favorites system, which both function online and offline. Offline functionality is provided via Background Sync processes in the Service Worker, which take favorites and submitted reviews from a newly implemented Store specifically for offline submissions, and pushing them to the server when connectability is reobtained. These submissions are then deleted from these stores to prevent duplicated submissions.

## How to install

The application requires NodeJS to function properly.

1. Clone this repo and the data server repo, which can be found [here](https://github.com/udacity/mws-restaurant-stage-3)

2. Navigate to both folders in your Terminal editor of choice. 

Use the command `node install` to install project dependencies require to build.

The data server can be started with the command 

```node server```

and the application can be built with the command

```gulp```

which will start the build process for the application and automatically launch it in a browser window when it's complete.

The application will utilize the ports __8080__ for the app itself and __1337__ for the API server.


IndexedDB Promised Library by Jake Archibald can be found [here](https://github.com/jakearchibald/idb)

Logic for the Review Submission, Favorite Button, and Background Sync was used from Alexandro Perez's MWS Project Walkthrough [here](https://alexandroperez.github.io/mws-walkthrough/)
