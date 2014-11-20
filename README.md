# Hawkins

Minimalist continuous development

## Requirements

### web app

* github auth
* live list of queued/running builds ordered by push date
* live tailing of build status
* delete builds
* kill builds
* manuallly trigger builds

### Backend

* autosetups webhooks
* autoadds host key to gh project
* autoclones and caches repository
* configurable build concurrency
* simple deployment
  * no database or embedded sqlite3
  * deployable using docker:

 `docker run -d hawkins/hawkins -p 80:3000`

  * build configuration on repository, simple shell script
  * standalone commandline app:

## Scenarios

* user runs backend
  * backend drains build queue using specified concurrency
    * gets oldest pushed unprocessed build
    * clones the repository and the build branch
    * spawns a new process and runs Hawkfile inside repository
    * tails process output and updates the build output on firebase
    * updates build status on firebase
    * updates build status on github

  * user signs in using github
    * backend syncs available projects

  * user add project to hawkin
    * backend registers project
    * backend syncs available branches

  * backend receives github post receive hook
    * backend checks if project is in hawkins project list
    * backends adds the build to build queue

  * backend receives github branch deletion event
    * deletes all builds matching branch


gem install hawkins
hawkins --port=3000 --firebase-token="XXXX" --github-client-id=xxx --github-client-secret=xxx --concurrent-builds=2 --build-path=/var/hawkins`


npm install -g firebase-tools
git clone https://github.com/hawkins/ui.git hawkins-ui
cd hawkins-ui
firebase init
firebase deploy

## Resources

* https://github.com/ryankee/concrete
* https://github.com/Strider-CD/strider
* https://www.firebase.com/docs/web/libraries/angular/index.html
* https://github.com/oscardelben/firebase-ruby
* https://github.com/tobi/clarity
* http://faye.jcoglan.com/ruby.html
* https://github.com/faye/faye-websocket-ruby
* https://github.com/monterail/angular-faye

## Contributing

1. Fork it ( https://github.com/[my-github-username]/hawkin/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
