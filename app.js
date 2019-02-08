//import { setTimeout } from 'timers';

// Read ENV file
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const Queuer = require('./queuer');
const randomstring = require('randomstring');

let authToken = "";
let queues = [];

client.on('ready', () => {
	// Try to login
	login();
	client.user.setPresence({ game: { name: 'bmbl.mijnproject.nu', type: 2 } }).then(console.log).catch(console.error);

});

client.on('message', message => {

	var me = this;
	console.log("Discord message:", message.content);

	if (message.channel.name != "bumblebee") { return; }
	if (!message.member.voiceChannel) { return; }
	if (!message.member) { return; }
	if (message.member.user.bot) { return; }

	// createOrUpdateUser(message);

	// Generate unique name for the queue we are going to use
	// Readable + unique
	var queueName = message.member.guild.name + message.member.guild.id;

	if (!queues[queueName]) {
		queues[queueName] = new Queuer();
	}

	// Current queue for guild (aka server)
	var queue = queues[queueName];

	queue.push(function (queuer) {
		message.member.voiceChannel.join().then(connection => {
			var options = {
				url: 'http://' + api() + '/v1/tts',
				body: { "text": message.content },
				json: true,
				headers: { 'Authorization': this.authToken }
			};

			request.post(options, function (error, response, body) {

				if (body.fragments && body.fragments.length > 0) {

					let missingWords = body.fragments.filter(fragment => {
						if (fragment._id) {
							return false;
						}
						return true;
					}).map(fragment => { return " " + fragment.text });

					if (missingWords && missingWords.length > 0) {
						message.reply('Missing words:' + missingWords);
					}
				}

				if (body && body.file) {

					// let filepath = __dirname + '/../api' + body.file;
					let filepath = 'http://' + api() + body.file;

					console.log('Playing file:', filepath);

					const dispatcher = connection.playStream(filepath, function (err, intent) {
						console.log('err:', err);
						console.log('intent:', intent);
					});

					dispatcher.on('start', function () {
						connection.player.streamingData.pausedTime = 0; // Fixes delays after starting different streams
					});

					dispatcher.on('end', function () {

						var options = {
							url: filepath,
							headers: { 'Authorization': this.authToken }
						};
						request.delete(options, function (error, response, body) {
							if (error || response && response.statusCode != 200) {
								console.log(error, response.statusCode, body);
								console.log('failed to delete', options.url);
							}
							else {
								console.log('deleted audio at', options.url);
							}

						});

						queuer.finish();
					});

					dispatcher.on('error', function (reason) {
						console.log('Dispatcher error ', reason)
						queuer.finish();
					});

					dispatcher.on('debug', function (info) {
						console.log(info)
					});
				}
				else {
					console.error("Something went wrong doing the API request", error, body);
					queuer.finish();
				}
			});

		}).catch(function (err) {
			console.log(err);
			queuer.finish()
		});
	});

	queue.run();

});

client.on('debug', info => {
	console.log(info);
});

client.login(token());

function api() {
	return process.env.API_HOST + ':' + process.env.API_PORT;
}

function token() {
	return process.env.API_TOKEN;
}

function login() {
	console.log('Ready!');

	var me = this;

	var options = {
		url: 'http://' + api() + '/v1/login',
		body: { "username": process.env.API_USERNAME, "password": process.env.API_PASSWORD },
		json: true
	};

	console.log('Trying to authenticate with Bumblebee API...');
	request.post(options, function (error, response, body) {
		if (body) {
			if (body.token) {
				me.authToken = body.token;
				console.log('Authenticated!');
			}
			else {
				console.log(body);
				console.log(body.error);
			}
		}
		else {
			// Seems like the API is down?
			console.error("Cannot connect to the API", options);
			setTimeout(() => {
				console.log("Retrying...");
				login();
			}, 5000)
		}
	});
}

function shutdown(data) {
	console.log("Exit with code:" + data);
	client.voiceConnections.forEach(function (connection, key) {
		// Disconnect
		console.log("Disconnecting from: " + connection.channel.name);
		connection.disconnect();
	});

	client.destroy();
	// Don't change this, otherwise nodemon will freak the fuck out :OOOOO
	process.kill(process.pid, data);
}

process.on('beforeExit', shutdown.bind());

//do something when app is closing
process.on('exit', shutdown.bind());

// //catches ctrl+c event
process.on('SIGINT', shutdown.bind());

// // catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', shutdown.bind());
process.once('SIGUSR2', shutdown.bind());

// function createOrUpdateUser(message) {

// 	let username = message.member.user.username + "#" + message.member.user.discriminator;
// 	let password = randomstring.generate({ length: 12, charset: 'alphabetic' });

// 	var options = {
// 		url: 'http://' + api() + '/v1/register',
// 		body: {
// 			"externalId": message.member.user.id,
// 			"name": message.member.user.username,
// 			"username": username,
// 			"password": password,
// 			"avatar": message.member.user.avatarURL,
// 		},
// 		json: true,
// 		headers: { 'Authorization': this.authToken }
// 	};

// 	console.log('Trying to create new user...');
// 	console.log(options);

// 	request.post(options, function (error, response, body) {

// 		if (error) {
// 			console.log(error)
// 		}

// 		if (body && body.success) {
// 			console.log('Registered user', username);

// 			let embed = new Discord.RichEmbed();
// 			embed.setDescription("For your convenience I've created an account for you so you can add your own audio to my database.");
// 			embed.setAuthor("Bumblebee", "https://www.dropbox.com/s/jl9h68lfk92j3q4/bumblee%20icon.png?dl=1", "https://bumblebee.fm");
// 			embed.setTitle("https://bumblebee.fm");
// 			embed.setURL("https://bumblebee.fm/login?username=" + username);
// 			embed.setFooter('Navigate to the URL above to get started');
// 			embed.setColor("#f6a821");

// 			embed.fields.push({ name: 'username', value: username });
// 			embed.fields.push({ name: 'password', value: password });
// 			message.member.send(embed);
// 		}
// 	});
// }
