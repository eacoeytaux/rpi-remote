const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const util = require('util');

// -- EXPRESS --

const express = require('express');
const app = express();

const port = process.env.PORT || 2112;;
app.listen(port, '0.0.0.0', function () {
	util.log('volcon listening on port ' + port);
});

function sendFile(res, filename, contentType) {
	contentType = contentType || 'text/html';

	fs.readFile(filename, function(error, content) {
		res.writeHead(200, {'Content-type': contentType});
		res.end(content, 'utf-8');
	})
}

app.get('/', function (req, res) {
	sendFile(res, 'public/index.html');
});

app.get('/style.css', function (req, res) {
	sendFile(res, 'public/css/style.css', 'text/css');
});

app.get('/power.png', function (req, res) {
	sendFile(res, 'public/icons/power.png', 'image/png');
});
app.get('/power_filled.png', function (req, res) {
	sendFile(res, 'public/icons/power_filled.png', 'image/png');
});
app.get('/volume_up.png', function (req, res) {
	sendFile(res, 'public/icons/volume_up.png', 'image/png');
});
app.get('/volume_up_filled.png', function (req, res) {
	sendFile(res, 'public/icons/volume_up_filled.png', 'image/png');
});
app.get('/volume_down.png', function (req, res) {
	sendFile(res, 'public/icons/volume_down.png', 'image/png');
});
app.get('/volume_down_filled.png', function (req, res) {
	sendFile(res, 'public/icons/volume_down_filled.png', 'image/png');
});
app.get('/hdmi_input.png', function (req, res) {
        sendFile(res, 'public/icons/hdmi_input.png', 'image/png');
});
app.get('/hdmi_input_filled.png', function (req, res) {
        sendFile(res, 'public/icons/hdmi_input_filled.png', 'image/png');
});
app.get('/tv_input.png', function (req, res) {
	sendFile(res, 'public/icons/tv_input.png', 'image/png');
});
app.get('/tv_input_filled.png', function (req, res) {
	sendFile(res, 'public/icons/tv_input_filled.png', 'image/png');
});
app.get('/bluetooth.png', function (req, res) {
	sendFile(res, 'public/icons/bluetooth.png', 'image/png');
});
app.get('/bluetooth_filled.png', function (req, res) {
	sendFile(res, 'public/icons/bluetooth_filled.png', 'image/png');
});
app.get('/apple-icon-57x57.png', function (req, res) {
	sendFile(res, 'public/icons/apple-icon-57x57.png', 'image/png');
});
app.get('/apple-icon-114x114.png', function (req, res) {
	sendFile(res, 'public/icons/apple-icon-114x114.png', 'image/png');
});
app.get('/apple-icon-144x144.png', function (req, res) {
	sendFile(res, 'public/icons/apple-icon-144x144.png', 'image/png');
});

// -- PYTHON DRIVER --

var doubletap = false;

var volume_running = false;
var volume_queue = [];
var volume_queue_size = 0;
function volume(direction) {
	if (doubletap == false) {
        	doubletap = true;
        	setTimeout(function() { doubletap = false; }, 500);
		
		if (volume_running == false) {
			volume_running = true;
	
			util.log('volume: ' + direction);
			const script = exec('bash ./driver/step.sh ' + direction, function() {
				volume_running = false;
				if (volume_queue_size > 0) {
					var next_direction = volume_queue.shift();
					volume_queue_size -= 1;
					volume(next_direction);
				}
			});
		
			script.stdout.on('data', function(data) {
				util.log('stepper stdout: ' + data);
			});
		
			script.stderr.on('data', function(data) {
				util.log('stepper stderr: ' + data);
			});
		} else {
			volume_queue.push(direction);
			volume_queue_size += 1;
		}
	}
}

function ir_remote(command) {
        if (doubletap == false) {
        	doubletap = true;
        	setTimeout(function() { doubletap = false; }, 500);	
		
		util.log('command: ' + command);
		key = '';
		remote = '';
		if (command == 'power') {
			key = 'POWER';
			remote = 'pi-remote-tv';
		} else if (command == 'tv-source') {
	                key = 'S';
	                remote = 'pi-remote-tv';
	        } else if (command == 'hdmi-source') {
			key = 'DOWN';
			remote = 'pi-remote-hdmi';
		}
	
		const script = exec('irsend SEND_ONCE ' + remote + ' KEY_' + key);
	
		script.stdout.on('data', function(data) {
			util.log('infrared stdout: ' + data);
		});
	
		script.stderr.on('data', function(data) {
			util.log('infrared stderr: ' + data);
		});
        } 
}

app.post('/vol_up', function(req, res) {
	volume('up');
	sendFile(res, 'public/index.html');
});

app.post('/vol_down', function(req, res) {
	volume('down');
	sendFile(res, 'public/index.html');
});

app.post('/power', function(req, res) {
	ir_remote('power');
	sendFile(res, 'public/index.html');
});

app.post('/tv-source', function(req, res) {
	ir_remote('tv-source');
	sendFile(res, 'public/index.html');
});

app.post('/hdmi-source', function(req, res) {
        ir_remote('hdmi-source');
        sendFile(res, 'public/index.html');
});

