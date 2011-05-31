"use strict";

$(function() {
	var D39 = Dumb3Of9Decoder,
		output = $('#output'),
		status = $('#status'),
		statusURL = $('#statusURL'),
		queue = $({});
		
	function log(className, code) {
		$('<li/>').prop('class', className).html(code).appendTo(output);
	}

	$('#decodeButton').click(function() {
		var url = $('#filename').val().replace(/^\s+|\s+$/g, '');
		
		if(!url) {
			log('error', 'You must fill in the filename field.');
			return;
		}
		
		if(/^[^\/]*:|^\/\//.test(url)) {
			log('error', 'Because of browser security limitations, ' +
				'this test suite cannot retrieve absolute URLs.');
			return;
		}
		
		var timeoutFired = false,
			timeout = setTimeout(function() {
				timeoutFired = true;
				log('error', 'An image failed to load.');
				status.hide();
				queue.dequeue();
			}, 10000);
		
		D39.loadImage(url, function(img) {
			if(timeoutFired) {
				return;
			}
			clearTimeout(timeout);
			queue.queue(function() {
				var startTime = $.now();
				statusURL.text(url);
				status.show();
				D39.decodeImageAsync(img, function(result) {
					var endTime = $.now();
					if(result === null) {
						log('error', 'No barcode recognized (took ' +
							(endTime - startTime) + ' ms)');
					} else {
						log('ok', '<code>' + result + '</code> (took ' +
							(endTime - startTime) + ' ms)');
					}
					if(!queue.queue().length) {
						status.hide();
					}
					queue.dequeue();
				});
			});
		});
	});
});