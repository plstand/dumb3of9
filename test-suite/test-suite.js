"use strict";

$(function() {
	
	var D39 = Dumb3Of9Decoder,
		output = $('#output'),
		status = $('#status'),
		queue = $({});
		
	function log(className, code) {
		$('<li/>').prop('class', className).html(code).appendTo(output);
	}
	
	function escapeHTML(text) {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function queueTestCase(url, expected) {
	
		url = $.trim(url);
		
		queue.queue(function(next) {
		
			if(!url) {
				log('error', 'You must fill in the filename field.');
				return;
			}
			
			if(/^[^\/]*:|^\/\//.test(url)) {
				log('error', 'Because of browser security limitations, ' +
					'this test suite cannot retrieve absolute URLs.');
				return;
			}
			
			status.text('Loading image "' + url + '"');
			status.show();
			
			var timeoutFired = false,
				timeout = setTimeout(function() {
					timeoutFired = true;
					log('error', 'The image "' + escapeHTML(url) +  '" failed to load.');
					status.hide();
					queue.dequeue();
				}, 10000);
			
			D39.loadImage(url, function(img) {
			
				if(timeoutFired) {
					return;
				}
				clearTimeout(timeout);
				
				status.text('Decoding image "' + url + '"');
				var startTime = $.now();
				
				D39.decodeImageAsync(img, function(result) {
				
					var endTime = $.now();
					
					if(expected) {
					
						result = result || '?';
						if(result != expected) {
							log('error', escapeHTML(url) + ': expected <code>' + expected +
								'</code>, got <code>' + result + '</code> (took ' +
								(endTime - startTime) + ' ms)');
						} else {
							log('ok', escapeHTML(url) + ': got correct output <code>' +
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