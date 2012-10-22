/* test_bot.js
 *
 * This is a *very* simple test bot that clones down a
 * specified repo, checks out a hash, and runs the tests.
 * Right now, only ruby apps are supported.  The rake
 * tasks that are run are "rake spec" and "rake cucumber".
 */
var async = require('async')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , os = require('os')
  , util = require('util')
  , path = require('path')
  , fs = require('fs')
  , tmpDir = path.join(os.tmpDir(), 'testuino');

// Ensure we have a directory to store the cloned repos
if(!fs.existsSync(tmpDir)) {
  util.log("Creating tmp dir: " + tmpDir);
  fs.mkdirSync(tmpDir);
}

/* clearRepo
 *
 * Clear any existing files to prevent any wierd error states
 *
 * @param localPath    path to the local repo
 * @param cb           callback(error, message)
 */
function clearRepo(localPath, cb) {
  fs.exists(localPath, function(exists) {
    if(!exists) return cb(null, 'Fresh clone');

    util.log("Wiping " + localPath);
    exec( 'rm -rf ' + localPath, cb);
  });
}

/* cloneRepo
 *
 * Clone down the latest copy of the repo
 *
 * @param localPath    path to local repo
 * @param url          url of the git repo to clone
 * @param cb           callback(err, message)
 */
function cloneRepo(localPath, url, cb) {
  util.log("Cloning " + url);
  exec('git clone ' + url + ' ' + localPath, { env: process.env }, cb);
}

/* checkoutCommit
 *
 * Check out the latest commit to test
 *
 * @param localPath     path to local repo
 * @param commitHash    hash of the commit to be tested
 * @param cb            callback(err, message)
 */
function checkoutCommit(localPath, commitHash, cb) {
  util.log("Checking out " + commitHash);
  exec('git checkout ' + commitHash, { cwd: localPath, env: process.env }, cb);
}

/* bundleInstall
 *
 * Install any dependencies via bundler.  Right now only
 * ruby apps that use bundler are supported.
 *
 * @param localPath    path to local repo
 * @param cb           callback(error, message)
 */
function bundleInstall(localPath, cb) {
  util.log("Installing dependencies");
  exec('bundle install', { cwd: localPath, env: process.env }, cb);
}

/* runTests
 *
 * Run the tests of a specified type via rake.  Sets the
 * RAILS_ENV to "test".
 *
 * @param localPath    path to local repo
 * @param type         rake task to run (spec, cucumber, etc)
 * @param cb           callback(err, message)
 */
function runTests(localPath, type, cb) {
  var tests = spawn('bundle', ['exec', 'rake', type, 'RAILS_ENV=test'], { cwd: localPath, env: process.env });

  tests.on('exit', function (code) {
    if(code === 0) {
      return cb(null, true);
    }

    return cb(null, false);
  });
}

/* test
 *
 * The public interface for the test bot.  Clears any existing
 * files in the local repo, clones down a fresh copy, checks
 * out a specified commit hash, bundle installs any dependencies,
 * and runs the specs and features for the repo.
 *
 * @param name      name of the repositiory
 * @param url       url to clone from
 * @param commit    commit hash to be tested
 * @param cb        callback(error, pass)
 */
function test(name, url, commit, cb) {
  var localDir = path.join(tmpDir, name);

  async.series([
    async.apply(clearRepo, localDir),
    async.apply(cloneRepo, localDir, url),
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
