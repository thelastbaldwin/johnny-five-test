'use strict';
var express = require('express'),
	app = express(),
	j5 = require('johnny-five'),
	board = new j5.Board(),
	led, button,
	potentiometer, shiftRegister,
	port = process.argv[2] || 8000,
	mustacheExpress = require('mustache-express'),
	server = app.listen(port, function(){
		console.log('Listening on port %d', server.address().port);
	}),
	io = require('socket.io')(server),
	setShiftRegisterInterval,
	shiftRegisterInterval;

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.set('view cache', false);

//use static directories
app.use('/js', express.static(__dirname + '/js'));
app.use('/style', express.static(__dirname + '/style'));

//routes
app.get('/', function (req, res) {
	res.render('index');
});

board.on('ready', function() {
	led = new j5.Led(13);
	button = new j5.Button(7);
	potentiometer = new j5.Sensor({
		pin: 'A0'
	});
	shiftRegister = new j5.ShiftRegister({
		pins: {
			data: 2,
			clock: 3,
			latch: 4
		}
	}),

	setShiftRegisterInterval = function(steps, duration){
		var mySteps = steps,
		stepInterval = (duration * 1000)/mySteps.length,
		index = 0;

		clearInterval(shiftRegisterInterval);
		shiftRegisterInterval = setInterval(function(){
			index = (index + 1) % mySteps.length;
			shiftRegister.send(mySteps[index]);
		}, stepInterval);
	};

	button.on('down', function() {
		// led.toggle();
		io.sockets.emit('button down');
	});

	button.on('up', function(){
		io.sockets.emit('button released');
	});

	potentiometer.on('change', function() {
		// returns value from 0 to 1023
		io.sockets.emit('potentiometer change', {value: this.value});
	});
});

io.on('connection', function (socket) {
	socket.on('shiftRegister pattern', function(data){
		console.log('message received');
		setShiftRegisterInterval(data.pattern, data.duration);
	});
});
