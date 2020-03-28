//import { setTimeout } from 'timers';

// Read ENV file
require('dotenv').config();

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL;

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const Queuer = require('./queuer');

let authToken = "";
let queues = [];
let timers = {};

const timeout = (parseInt(process.env.CHANNEL_TIMEOUT) * 1000) || 1000 * 60 * 5; // 1000 * 60 * 5 = 5 minutes;

console.log(process.env);

client.on('ready', () => {
	// Try to login
	login();
	client.user.setPresence({ game: { name: 'bmbl.mijnproject.nu', type: 2 } }).then((data) => { logger.debug(data)}).catch(console.error);
});

client.on('message', message => {
	
	const me = this;

	if(
		!(message.channel.name.indexOf("bumblebee") >= 0 ||
		message.content.indexOf("-tts") >= 0)
		){ 
			return; 
	}
	if (!message.member) { return; }
	if (!message.member.voice.channelID) { return; }
	if (message.member.user.bot) { return; }

	
	// Only log in the bumblebee channel
	logger.info("💬 " + message.author.username + ": " + message.content);

	// 


	// Generate unique name for the queue we are going to use
	// Readable + unique
	const queueName = message.member.guild.name + message.member.guild.id;

	if (!queues[queueName]) {
		queues[queueName] = new Queuer();
	}

	if(message.content === '!disconnect'){
		try{
			const channel = client.voice.connections.find(val => val.channel.guild.id === message.guild.id);
			let queue = queues[queueName];
			queue.finish();
			if(channel != null){
				channel.disconnect();
				return;
			}
		}catch(e){
			logger.warn("Failed to disconnect due to");
			logger.warn(e.message);
		}
	}

	// Use the queue name for timeout purposes
	if(timers[queueName] != null){
		logger.debug("⏰ Clearing timer for " + queueName);
		clearTimeout(timers[queueName]);
	}


	// Set new timeout
	timers[queueName] = setTimeout(() => {
		var channel = client.voice.connections.find(val => val.channel.guild.id === message.guild.id);
		if(channel != null){
			message.channel.send('👋 Leaving voice channel due to inactivity');
			logger.info("👋 Leaving voice channel in channel ");
			channel.disconnect();
			return;
		}
	}, timeout);

	// Current queue for guild (aka server)
	var queue = queues[queueName];

	queue.push(function (queuer) {
		message.member.voice.channel.join().then(connection => {
			var options = {
				url: api() + '/v1/tts',
				body: { "text" : message.content },
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
					let filepath = api() + body.file;
					logger.info("📣 Playing file: " + filepath);



					const streamOptions = {
						seek: 0,
						volume: 1,
						bitrate: 'auto'
					}
					const dispatcher = connection.play(filepath, streamOptions);

					dispatcher.on('start', function () {
						connection.player.streamingData.pausedTime = 0; // Fixes delays after starting different streams
					});

					dispatcher.on('finish', function () {
						var options = {
							url: filepath,
							headers: { 'Authorization': this.authToken }
						};
						request.delete(options, function (error, response, body) {
							if (error || response && response.statusCode != 200) {
								logger.debug(error);
								logger.warn('🚨 failed to delete ' + options.url);
							}
							else {
								logger.info("🗑 deleted audio at " + options.url);
							}
						});

						queuer.finish();
					});

					dispatcher.on('error', function (reason) {
						console.log(reason);
						queuer.finish();
					});

					dispatcher.on('debug', function (info) {
						console.log(info);
						logger.debug(info);
					});
				}
				else {
					console.error("Something went wrong doing the API request", error, body);
					queuer.finish();
				}
			});

		}).catch(function (err) {
			console.log(err);
			logger.warn(err);
			queuer.finish()
		});
	});

	queue.run();

});

client.on('debug', info => {
	logger.debug(info);
});

client.login(token());

function api() {
	return process.env.API_HOST;
}

function token() {
	return process.env.API_TOKEN;
}

function login() {
	logger.info('Ready to rollout');

	var me = this;

	var options = {
		url: api() + '/v1/login',
		body: { "username": process.env.API_USERNAME, "password": process.env.API_PASSWORD },
		json: true
	};
	logger.info('❕ Establishing connection with Bumblebee API @ ' + api());
	request.post(options, function (error, response, body) {
		if (body) {
			if (body.token) {
				me.authToken = body.token;
				logger.info('🔓 Authenticated');
			}
			else {
				logger.warn('🔐 Authentication failed: ' + body.error);
			}
		}
		else {
			// Seems like the API is down?
			logger.warn('🚨 Cannot connect to api', options)
			setTimeout(() => {
				logger.info('Trying to log back in again');
				login();
			}, 5000)
		}
	});
}

function shutdown(data) {
	console.log("Exit with code:" + data);
	client.voice.connections.forEach(function (connection, key) {
		// Disconnect
		console.log("Disconnecting from: " + connection.channel.name);

		connection.disconnect();
	});
	client.destroy();
	// Don't change this, otherwise nodemon will freak the fuck out :OOOOO
	process.kill(process.pid, data);
}

function makeid(length) {
	let result           = '';
	let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }

// process.on('beforeExit', shutdown.bind());

//do something when app is closing
// process.on('exit', shutdown.bind());

// //catches ctrl+c event

// process.on('SIGINT', shutdown.bind());

// // catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', shutdown.bind());
// process.once('SIGUSR2', shutdown.bind());

// process.on('uncaughtException', (err, origin) => {
// 	console.log(err);
// 	console.log(origin);
// 	process.exit(1);
//   });
