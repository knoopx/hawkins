# Hawkins

A no muss, no fuss continuous integration software

## Features

* No muss, no fuss deployment. nodejs is the only dependency.
* Realtime build status and colored runner output
* Simple, straightforward configuration. Just add a `Hawkfile` to your repository and push to GitHub.

## Installation

* Create a new app at https://www.firebase.com/
* Clone this repository and deploy it to firebase:

  ```
  npm install -g firebase-tools
  git clone https://github.com/knoopx/hawkins.git
  cd hawkins
  firebase init
  firebase deploy
  ```

* Access the app at http://xxx.firebaseapp.com/

## Worker Installation

* Go to your GitHub repository settings and add a push-only webhook pointing to `https://xxx.firebaseio.com/pushes/.json`
* Install the worker on as many machines as needed:

  ```
  sudo npm install -g coffee-script forever
  git clone https://github.com/knoopx/hawkins-worker.git
  cd hawkins-worker
  npm install
  ```

* Edit `script/runner` to fit your needs. By default it clones, caches and runs `Hawkfile` on your repository. 
* Start the worker with:

  `forever start -c coffee hawkins-worker.coffee --firebase https://xxx.firebaseio.com`

* Add a `Hawkfile` with your app-specific test/build/deploy logic. To use whatever language you prefer just prepend a shebang.
* Push your repository
