"use strict";

var dec = Dumb3Of9Decoder,
	ta = byId('ta'),
	but = byId('decodeButton');

function byId(id) {
	return document.getElementById(id);
}

function showLine(str) {
	ta.value += str;
	ta.value += '\n';
}

but.onclick = function() {
	var timeoutFired = false,
		timeout = setTimeout(function() {
			but.disabled = false;
			but.innerHTML = but.oldHTML;
			showLine('Image failed to load within 10 seconds.');
		}, 10000),
		startTime = Date.now();
	but.disabled = true;
	but.oldHTML = but.innerHTML;
	but.innerHTML = 'Please wait...';
	dec.loadImage(byId('filename').value, function(img) {
		if(timeoutFired) {
			return;
		}
		clearTimeout(timeout);
		dec.decodeImageAsync(img, function(result) {
			var endTime = Date.now();
			if(result === null) {
				result = '?';
			}
			showLine('(' + (endTime - startTime) + ' ms) ' + result);
			but.disabled = false;
			but.innerHTML = but.oldHTML;
		});
	});
};