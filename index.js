const encodeurl = require("encodeurl");
// const fs = require("fs");
const Application = require("jxa").Application;
const iTunes = Application("Music");
const moment = require("moment");

const path = __dirname + "/trackInfo.txt";

require("dotenv").config({
	path: "/Users/maxmatthews/Developer/slacktunes-node/.env",
});

setInterval(async () => {
	// (async () => { 	//immediate run for debug

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
				const res = await fetch(
					`https://slack.com/api/users.profile.set?profile=%7B%22status_emoji%22%3A%22:headphones:%22%2C%22status_text%22%3A%22${trackInfo}%22,"status_expiration":${expire}%7D`,
					{ method: "POST", headers: { Authorization: `Bearer ${value}` } }
				);
				console.log(await res.text());
			}
		}
	}
	// })(); //immediate run for debug
}, 1000 * 60);
