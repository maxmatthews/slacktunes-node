const itunes = require("./playback/index.js");
const request = require("request");
const encodeurl = require("encodeurl");
const fs = require("fs");

const path = __dirname + "/shouldClear.txt";

require("dotenv").config({
	path: "/Users/maxmatthews/Developer/slacktunes-node/.env"
});

itunes.currentTrack(data => {
	if (data) {
		if (data.artist.length > 25) {
			data.artist = data.artist.substring(0, 20) + "...";
		}
		if (data.name.length > 25) {
			data.name = data.name.substring(0, 20) + "...";
		}

		if (data.album.length > 20) {
			data.album = data.album.substring(0, 15) + "...";
		}

		const trackInfo = encodeurl(
			`${data.artist} :musical_note:${data.name} :cd:${data.album}`
		)
			.replace(/\&/g, "%26")
			.replace(/\(|\)|\?|\+|\&/g, "");

		request({
			url: `https://slack.com/api/users.profile.set?token=${process.env.SLACK_TOKEN}&profile=%7B%22status_emoji%22%3A%22:headphones:%22%2C%22status_text%22%3A%22${trackInfo}%22%7D`,
			method: "POST"
		}).on("response", () => {
			if (!fs.existsSync(path)) {
				fs.writeFileSync(path, "");
			}

			process.exit();
		});
	} else {
		if (fs.existsSync(path)) {
			request({
				url: `https://slack.com/api/users.profile.set?token=${process.env.SLACK_TOKEN}&profile=%7B%22status_emoji%22%3A%22%22%2C%22status_text%22%3A%22%22%7D`,
				method: "POST"
			}).on("response", () => {
				fs.unlinkSync(path);

				process.exit();
			});
		} else {
			process.exit(); //the status was already cleared, so we don't have to do it, just end the script
		}
	}
});
