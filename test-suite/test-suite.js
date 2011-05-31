"use strict";

$(function() {
	var D39 = Dumb3Of9Decoder,
		output = $('#output');
		
	function log(className, code) {
		$('<li/>').prop('class', className).html(code).appendTo(output);
	}

	$('#decodeButton').click(function() {
		function timeoutHandler() {
			timeoutFired = true;
			log('error', 'The image failed to load.')
		}
		
		var url = $('#filename').val();
		
		if(/^\s*$/.test(url)) {
			log('error', 'You must fill in the filename field.');
			return;
		}
		
		if(/^[^\/]*:/.test(url)) {
			log('error', 'Because of browser security limitations, ' +
				'this test suite cannot retrieve absolute URLs.');
			return;
		}
		
		var timeoutFired = false,
			timeout = setTimeout(timeoutHandler, 10000),
			startTime = $.now();
		
		D39.loadImage($('#filename').val(), function(img) {
			if(timeoutFired) {
				return;
			}
			clearTimeout(timeout);
			D39.decodeImageAsync(img, function(result) {
				var endTime = $.now();
				if(result === null) {
					log('error', 'No barcode recognized (took ' +
						(endTime - startTime) + ' ms)');
				} else {
					log('ok', '<code>' + result + '</code> (took ' +
						(endTime - startTime) + ' ms)');
				}
			});
		});
	});
});