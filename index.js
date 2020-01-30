// const itunes = require("./playback/index.js");
const request = require("request");
const encodeurl = require("encodeurl");
// const fs = require("fs");
const Application = require("jxa").Application;
const iTunes = Application("Music");
const moment = require("moment");

const path = __dirname + "/trackInfo.txt";

require("dotenv").config({
	path: "/Users/maxmatthews/Developer/slacktunes-node/.env"
});

setInterval(() => {
	// console.log("hit");
	let data;
	try {
		const state = iTunes.playerState();
		if (state && state === "playing") {
			const name = iTunes.currentTrack.name();
			const artist = iTunes.currentTrack.artist();
			const album = iTunes.currentTrack.album();
			data = { name, artist, album, state };
		} else {
			data = { name: null };
		}
	} catch (e) {
		console.log(e);
		data = { name: null };
	}
	// console.log(data.state);
	if (data.name && data.state === "playing") {
		const duration = iTunes.currentTrack.duration();
		const currentPosition = iTunes.playerPosition();
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

		const expire = moment()
			.add(duration + 60.1, "seconds")
			.subtract(currentPosition, "seconds")
			.format("X");

		for (const [key, value] of Object.entries(process.env)) {
			if (key.includes("SLACK_TOKEN")) {
				request({
					url: `https://slack.com/api/users.profile.set?token=${value}&profile=%7B%22status_emoji%22%3A%22:headphones:%22%2C%22status_text%22%3A%22${trackInfo}%22,"status_expiration":${expire}%7D`,
					method: "POST"
				}).on("response", () => {
					// if (!fs.existsSync(path)) {
					// 	fs.writeFileSync(path, "");
					// }
				});
			}
		}
	}
	//  else {
	// if (fs.existsSync(path)) {
	// 	for (const [key, value] of Object.entries(process.env)) {
	// 		if (key.includes("SLACK_TOKEN")) {
	// 			request({
	// 				url: `https://slack.com/api/users.profile.set?token=${
	// 					process.env.SLACK_TOKEN
	// 				}&profile=%7B%22status_emoji%22%3A%22%22%2C%22status_text%22%3A%22%22%7D`,
	// 				method: "POST"
	// 			}).on("response", () => {
	// 				fs.unlinkSync(path);
	//
	// 				// process.exit();
	// 			});
	// 		}
	// 	}
	// } else {
	// 	// process.exit(); //the status was already cleared, so we don't have to do it, just end the script
	// }
	// }
}, 1000 * 60);
