var dec = Dumb3Of9Decoder,
	byId = document.getElementById.bind(document),
	ta = byId('ta');

function showLine(str) {
	ta.value += str;
	ta.value += '\n';
}

byId('decodeButton').onclick = function() {
	dec.loadImage(byId('filename').value, function(img) {
		var result = dec.decodeImage(img);
		if(result === null) {
			result = '?';
		}
		showLine(result);
	});
};