'use strict';

var j5 = require('johnny-five'),
	board = new j5.Board(),
	led,
	button,
	// toggle,
	potentiometer,
	shiftRegister;

board.on('ready', function(){
	led = new j5.Led(13);
	button = new j5.Button(7);
	// toggle = new j5.Pin({
	// 	pin: 7,
	// 	mode: 0 //input
	// });
	//alternatively could do new j5.Sensor('A0')
	potentiometer = new j5.Sensor({
		pin: 'A0'
	});
	shiftRegister = new j5.ShiftRegister({
		pins: {
			data: 2,
			clock: 3,
			latch: 4
		}
	});

	// var value = 0;
	// function next(){
	// 	value = value > 0x11 ? value >> 1 : 0x88;
	// 	shiftRegister.send( value );
	// 	setTimeout(next, 300);
	// }

	button.on('down', function(){
		console.log('button pressed');
		led.toggle();
	});

	//unused code for a swtich/bare pin
	// toggle.on('high', function(){
	// 	console.log('switch active');
	// });

	// toggle.on('low', function(){
	// 	console.log('switch inactive');
	// });

	// toggle.read(function(value){
	// 	console.log('toggle value: ', value);
	// });

	potentiometer.on('change', function(){
		console.log('potentiometer value: ', this.value);
	});

	this.repl.inject({
        led: led,
		sr: shiftRegister
	});
});
