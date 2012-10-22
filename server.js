var util = require('util')
  , test_bot = require('./test_bot')
  , Testuino = require('./testuino')
  , testuino = new Testuino
  , SendGrid = require('sendgrid').SendGrid
  , sendgrid = new SendGrid(process.env.SENDGRID_USER, process.env.SENDGRID_PASS)
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 3000

app.configure(function() {
  app.use(express.bodyParser());
});

app.post('/github', function(req, res) {
  if(!req.body.payload) {
    util.log("Malformed request: " + JSON.stringify(req.body));
    res.statusCode = 400;
    return res.send("ERROR");
  }

  testuino.reset();

  var payload = JSON.parse(req.body.payload)
    , name = payload.repository.name
    , url = "git@github.com:" + payload.repository.owner.name + '/' + name + '.git'
    , lastCommit = payload.commits[payload.commits.length - 1];

  if(!lastCommit) {
    util.log("Nothing to commit");
    return res.send("OK");
  }

  testuino.pending();
  util.log("Testing commit by " + lastCommit.author.name + " for " + url);

  test_bot.test(name, url, lastCommit.id, function(err, pass) {
    var passed = (!err && pass)
      , passText = (passed) ? "PASS" : "FAIL"
      , text = "You last build for " + name + " just made it through Testuino!  It resulted in a: " + passText + ". \n\r\n\r You can view the commit on github here: \n\r\n\r" + payload.repository.url + "\n\r\n\r Thanks,\n\rThe Testuino Notifier";

    testuino.finish(passed);
    sendgrid.send({
      to: lastCommit.author.email,
      from: 'build.notifier@testuino.com',
      subject: 'Build status for ' + payload.repository.owner.name + '/' + name,
      text: text
    }, function(success, message) {
      if(!success) util.log(message);
    });
  });

  res.send("OK");
});

testuino.on('ready', function() {
  app.listen(port, function() {
    util.log("Listening on port " + port);
  });
});
