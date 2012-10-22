var five = require("johnny-five")
  , EventEmitter = require('events').EventEmitter
  , util = require('util');

function Testuino() {
  var self = this;
  self._board = new five.Board()
  self._board.on("ready", function() {
    self._loadLeds()
    self.emit('ready');
  });

  EventEmitter.call(this);
}

util.inherits(Testuino, EventEmitter);

Testuino.prototype._loadLeds = function() {
  this._green = new five.Led(13);
  this._yellow = new five.Led(12);
  this._red = new five.Led(11);
  this._buzz = new five.Led(10);
};

/* reset
 *
 * Turn the Leds and Buzzer off.
 */
Testuino.prototype.reset = function() {
  var self = this;
  ["_green", "_yellow", "_red", "_buzz"].forEach(function(sensor) {
    self[sensor].stop().off();
  });
};

/* pending
 *
 * Strobe the yellow Led because a build is pending
 */
Testuino.prototype.pending = function() {
  this._yellow.strobe(300);
  this.emit('pending');
}

/* finish
 *
 * Stops the yellow Led from stobing, rings the buzzer for
 * one second and then turns on the green or red Led depending
 * if the build passed or failed respectivly.
 *
 * @param pass    did the build pass or fail
 */
Testuino.prototype.finish = function(pass) {
  var self = this;

  self._yellow.stop().off();
  self._buzz.on();
  setTimeout(function() { self._buzz.off() }, 1000);

  if(pass) {
    self._green.on();
  } else {
    self._red.on();
  }

  self.emit('finished');
}

module.exports = Testuino;
