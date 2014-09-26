/* global io, $ */

'use strict';

var socket = io.connect('http://localhost:8000');
socket.on('button down', function(){
	$('img').toggleClass('hidden');
});

//array, int
function generateColorRamp(colors, steps){
	colors.push(colors[0]);

	var colorIntervals = [],
	i, j,
	deltaR,
	deltaG,
	deltaB,
	intervalSteps = steps / colors.length,
	currentColorIndex,
	nextColorIndex;

	for(i = 0; i < colors.length; i++){
		if(i === colors.length - 1){
			currentColorIndex = i - 1;
			nextColorIndex = 0;
		}else{
			currentColorIndex = i;
			nextColorIndex = i + 1;
		}
		deltaR = (colors[nextColorIndex][0] - colors[currentColorIndex][0]) / intervalSteps;
		deltaG = (colors[nextColorIndex][1] - colors[currentColorIndex][1]) / intervalSteps;
		deltaB = (colors[nextColorIndex][2] - colors[currentColorIndex][2]) / intervalSteps;

		for(j = 0; j < intervalSteps; j++){
			var newColor = [
				Math.abs(parseInt(colors[i][0] + deltaR * j, 10)),
				Math.abs(parseInt(colors[i][1] + deltaG * j, 10)),
				Math.abs(parseInt(colors[i][2] + deltaB * j, 10)),
			];

			colorIntervals.push(newColor);
		}
	}
	return colorIntervals;
}

var colorSteps = generateColorRamp([[0, 0, 0],[255, 255, 255]], 1024);

socket.on('potentiometer change', function(data){
	$('body').css({'backgroundColor': 'rgb(' + colorSteps[data.value] + ')'});
});

$(document).ready(function(){
	var pattern = [],
	$checkBoxes = $('input[type="checkbox"]'),
	$patternList = $('#pattern p');

	function clearCheckBoxes(){
		$checkBoxes.each(function(){
			this.checked = false;
		});
	}

	function getBinaryString($checkBoxes){
		var binaryString = '';
		$checkBoxes.each(function(){
			if(this.checked){
				binaryString += '1';
			}else{
				binaryString += '0';
			}
		});
		return binaryString;
	}

	function updatePatternList($patternList, pattern){
		$patternList.text(pattern.join(', '));
	}

	$('.addStep').on('click', function(){
		pattern.push(getBinaryString($checkBoxes));
		$(this).trigger('pattern.update', {
			patternList: $patternList,
			pattern: pattern
		});
	});

	$('.clearSteps').on('click', function(){
		pattern = [];
		clearCheckBoxes();
		$(this).trigger('pattern.update', {
			patternList: $patternList,
			pattern: pattern
		});
	});

	$('#controls').on('submit', function(event){
		event.preventDefault();
		var duration = parseFloat($('#duration').val());
		$(this).trigger('pattern.submit', {
			pattern: pattern,
			duration: duration
		});
	});

	$(window).on('pattern.update', function(event, data){
		updatePatternList(data.patternList, data.pattern);
	});

	$(window).on('pattern.submit', function(event, data){
		// remap patterns into proper binary
		var pattern = data.pattern.map(function(stringPattern){
			return parseInt(stringPattern, 2);
		});

		socket.emit('shiftRegister pattern', {
			pattern: pattern,
			duration: data.duration
		});
	});
});
