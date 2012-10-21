var util = require('util')
  , test_bot = require('./test_bot')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 3000;

app.configure(function() {
  app.use(express.bodyParser());
});

app.post('/github', function(req, res) {
  if(!req.body.payload) {
    util.log("Malformed request: " + JSON.stringify(req.body));
    res.statusCode = 400;
    return res.send("ERROR");
  }

  var payload = JSON.parse(req.body.payload)
    , name = payload.repository.name
    , url = "git@github.com:" + payload.repository.owner.name + '/' + name + '.git'
    , lastCommit = payload.commits[payload.commits.length - 1];

  if(!lastCommit) {
    util.log("Nothing to commit");
    return res.send("OK");
  }

  util.log("Testing commit by " + lastCommit.author.name + " for " + url);
  test_bot.test(name, url, lastCommit.id, console.log);

  res.send("OK");
});

app.listen(port, function() {
  console.log("Listening on port " + port);
});
