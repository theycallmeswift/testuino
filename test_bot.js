var async = require('async')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , os = require('os')
  , util = require('util')
  , path = require('path')
  , fs = require('fs')
  , tmpDir = path.join(os.tmpDir(), 'testuino');

if(!fs.existsSync(tmpDir)) {
  util.log("Creating tmp dir: " + tmpDir);
  fs.mkdirSync(tmpDir);
}

function clearRepo(localPath, cb) {
  fs.exists(localPath, function(exists) {
    if(!exists) return cb(null, 'Fresh clone');

    util.log("Wiping " + localPath);
    exec( 'rm -rf ' + localPath, cb);
  });
}

function cloneRepo(url, localPath, cb) {
  util.log("Cloning " + url);
  exec('git clone ' + url + ' ' + localPath, { env: process.env }, cb);
}

function checkoutCommit(localPath, commitHash, cb) {
  util.log("Checking out " + commitHash);
  exec('git checkout ' + commitHash, { cwd: localPath, env: process.env }, cb);
}

function bundleInstall(localPath, cb) {
  util.log("Installing dependencies");
  exec('bundle install', { cwd: localPath, env: process.env }, cb);
}

function runTests(localPath, type, cb) {
  var tests = spawn('bundle', ['exec', 'rake', type, 'RAILS_ENV=test'], { cwd: localPath, env: process.env });

  tests.on('exit', function (code) {
    if(code === 0) {
      return cb(null, true);
    }

    return cb(null, false);
  });
}

function test(name, url, commit, cb) {
  var localDir = path.join(tmpDir, name);

  async.series([
    async.apply(clearRepo, localDir),
    async.apply(cloneRepo, url, localDir),
    async.apply(checkoutCommit, localDir, commit),
    async.apply(bundleInstall, localDir)
  ], function(err, messages) {
    if(err) return cb(err);

    util.log("Running specs for " + name + "/" + commit);
    runTests(localDir, 'spec', function(err, pass) {
      if(err) return cb(err);
      if(!pass) return cb(err, false, "Specs");

      util.log("Running features for " + name + "/" + commit);
      runTests(localDir, 'cucumber', function(err, pass) {
        if(err) return cb(err);
        if(!pass) return cb(err, false, "Features");

        return cb(null, true);
      });
    });
  });
}

module.exports.test = test;
