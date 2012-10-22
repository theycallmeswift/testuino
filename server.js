var util = require('util')
  , test_bot = require('./test_bot')
  , Testuino = require('./testuino')
  , testuino = new Testuino
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
    testuino.finish(!err && pass);
  });

  res.send("OK");
});

testuino.on('ready', function() {
  app.listen(port, function() {
    util.log("Listening on port " + port);
  });
});
