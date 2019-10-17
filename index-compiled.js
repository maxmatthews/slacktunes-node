"use strict";

// const itunes = require("./playback/index.js");
var request = require("request");

var encodeurl = require("encodeurl");

var fs = require("fs");

var Application = require('jxa').Application;

var iTunes = Application('Music');
var path = __dirname + "/shouldClear.txt";

require("dotenv").config({
  path: "/Users/maxmatthews/Developer/slacktunes-node/.env"
});

var name = iTunes.currentTrack.name();
var artist = iTunes.currentTrack.artist();
var album = iTunes.currentTrack.album();
var data = {
  name: name,
  artist: artist,
  album: album
};

if (data.name) {
  if (data.artist.length > 25) {
    data.artist = data.artist.substring(0, 20) + "...";
  }

  if (data.name.length > 25) {
    data.name = data.name.substring(0, 20) + "...";
  }

  if (data.album.length > 20) {
    data.album = data.album.substring(0, 15) + "...";
  }

  var trackInfo = encodeurl("".concat(data.artist, " :musical_note:").concat(data.name, " :cd:").concat(data.album)).replace(/\&/g, "%26").replace(/\(|\)|\?|\+|\&/g, "");
  request({
    url: "https://slack.com/api/users.profile.set?token=".concat(process.env.SLACK_TOKEN, "&profile=%7B%22status_emoji%22%3A%22:headphones:%22%2C%22status_text%22%3A%22").concat(trackInfo, "%22%7D"),
    method: "POST"
  }).on("response", function () {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, "");
    }

    process.exit();
  });
} else {
  if (fs.existsSync(path)) {
    request({
      url: "https://slack.com/api/users.profile.set?token=".concat(process.env.SLACK_TOKEN, "&profile=%7B%22status_emoji%22%3A%22%22%2C%22status_text%22%3A%22%22%7D"),
      method: "POST"
    }).on("response", function () {
      fs.unlinkSync(path);
      process.exit();
    });
  } else {
    process.exit(); //the status was already cleared, so we don't have to do it, just end the script
  }
}
