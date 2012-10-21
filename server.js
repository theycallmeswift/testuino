var util = require('util')
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
    , url = payload.repository.url
    , lastCommit = payload.commits[0];

  util.log("Testing commit by " + lastCommit.author.name + " for " + url);

  res.send("OK");
});

app.listen(port, function() {
  console.log("Listening on port " + port);
});
