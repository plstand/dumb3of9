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

	function queueTestCase(url, expected) {
	
		url = $.trim(url);
		
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
			queue.queue(function(next) {
				var startTime = $.now();
				statusURL.text(url);
				status.show();
				D39.decodeImageAsync(img, function(result) {
					var endTime = $.now();
					if(expected) {
						result = result || '?';
						if(result != expected) {
							log('error', url + ': expected <code>' + expected +
								'</code>, got <code>' + result + '</code> (took ' +
								(endTime - startTime) + ' ms)');
						} else {
							log('ok', url + ': got correct output <code>' +
								result + '</code> (took ' +
								(endTime - startTime) + ' ms)');
						}
					} else {
						if(!result) {
							log('error', 'No barcode recognized (took ' +
								(endTime - startTime) + ' ms)');
						} else {
							log('ok', '<code>' + result + '</code> (took ' +
								(endTime - startTime) + ' ms)');
						}
					}
					status.hide();
					next();
				});
			});
		});
	}
	
	$('#decodeButton').click(function() {
		queueTestCase($('#filename').val());
	});
	
	$('#autoTestButton').click(function() {
		$.get('list.txt', function(data) {
			$.each(data.replace(/\r/g, '').split('\n'), function(lineNo, line) {
				var splitLine = line.split('\t');
				if(splitLine.length < 2) {
					return;
				}
				queueTestCase(splitLine[0], splitLine[1]);
			});
		});
	});
});