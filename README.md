# Testuino

A simple build status notifier powered by arduino.  Testuino listens for a commit
hook from Github and then runs the tests for the latest commit that came through.
A yellow LED strobes to indicate when a build is in progress and when the build
finishes, a buzzer sounds an either a green or red LED turns on to indicate the
status.  At the end of the build process, the owner of the branch gets an email
(powered by [SendGrid](http://sendgrid.com)) updating them with the status.

![WIP](https://raw.github.com/theycallmeswift/testuino/master/photos/wip.jpeg)

## Setup

Want your own Testuino?  Follow these instructions to get one up and running in
no time.

### Server

In order to use Testuino, Github must be able to reach your local machine via a
commit hook.  If you don't have a public facing server, you can use the awesome
[localtunnel](http://progrium.com/localtunnel/) library to expose your localhost
to the world.

#### 1. Github setup

Under the admin panel of any repo, there is a tab called "Service Hooks" where
you can manage webhooks from github to other services.  We want to create a
Webhook that points to our local Testuino server.  Click on the "Webhook URLs"
tab and fill in the url to your local server:

    http://url-to-your-testuino.com/github

You can verify that this is working by clicking the "Test Hook" button.

#### 2. Local setup

In order to recieve email notifications about your build statuses, you'll need
to add your [SendGrid](http://sendgrid.com) credentials to your enviornment.
You can either add them to you `.bash_profile` or export them like so:

    export SENDGRID_USER=my_sendgrid_username
    export SENDGRID_PASS=my_sendgrid_pass

All the git cloning is handled via ssh, so you'll want to make sure you can
clone any repos you're using with Testuino before you run the server.

### Arduino

*Instructions and schematics for the arduino portion comming soon!*
