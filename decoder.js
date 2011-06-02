"use strict";

var Dumb3Of9Decoder = {
	CODE39_CHARSET : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*',
	CODE39_TABLE : [88, 265, 268, 13, 280, 25, 28, 328, 73, 76,
					289, 292, 37, 304, 49, 52, 352, 97, 100, 112,
					385, 388, 133, 400, 145, 148, 448, 193, 196, 208,
					259, 262, 7, 274, 19, 22, 322, 67, 70, 42,
					138, 162, 168, 82],
	loadImage: function(url, callback) {
		var img = new Image();
		img.onload = function() {
			callback(img);
		};
		img.src = url;
	},
	drawImageToCanvas: function(img, width, height, angle) {
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			d = canvas.width = canvas.height = Math.max(width, height) * 2;
		
		ctx.save();		
		ctx.translate(d / 2, d / 2);
		ctx.rotate(angle);
		ctx.drawImage(img, -width / 2 + 0.5, -height / 2 + 0.5);
		ctx.restore();
		
		return canvas;
	},
	getMatrix: function(canvas) {
		var ctx = canvas.getContext('2d'), mat = [],
			data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		for(var y = 0; y < canvas.height; ++y) {
			mat[y] = [];
			for(var x = 0; x < canvas.width; ++x) {
				mat[y][x] = data[(y * canvas.width + x) * 4] < 128;
			}
		}
		return mat;
	},
	getDenoisedRowFromMatrix: function(mat, startRow, numRows) {
		var endRow = startRow + numRows, row = [],
			length = mat.length, threshold = Math.ceil(numRows / 2);
		for(var x = 0; x < length; ++x) {
			var count = 0;
			for(var y = startRow; y < endRow; ++y) {
				if(mat[y][x]) {
					++count;
				}
			}
			row[x] = count >= threshold;
		}
		return row;
	},
	measureElementWidthsFromRow: function(row) {
		var inBar = true, currentWidth = 0, length = row.length, mmts = [];
		for(var x = 0; x < length; ++x) {
			if(row[x] != inBar) {
				inBar = !inBar;
				mmts.push(currentWidth);
				currentWidth = 1;
			} else {
				++currentWidth;
			}
		}
		mmts.push(currentWidth);
		return mmts;
	},
	decodeFromMmtsAndStart: function(mmts, start) {
		var length = mmts.length - 9, str = '';
		for(var x = start; x < length; x += 10) {
			var charMmts = mmts.slice(x, x + 9).map(function(v, i) {
				return {i: i, v: v};
			});
			charMmts.sort(function(a, b) {
				return b.v - a.v;
			});
			var code = this.CODE39_TABLE.indexOf(
				(1 << charMmts[0].i) |
				(1 << charMmts[1].i) |
				(1 << charMmts[2].i)
			);
			if(code < 0) {
				return null;
			} else if(code == 43 && x != start) {
				return str;
			} else if(code != 43) {
				if(x - start < 2) {
					return null;
				}
				str += this.CODE39_CHARSET[code];
			}
		}
		return null;
	},
	decodeFromMmts: function(mmts) {
		var length = mmts.length - 9;
		for(var x = 0; x < length; ++x) {
			var result = this.decodeFromMmtsAndStart(mmts, x);
			if(result) {
				return result;
			}
		}
		return null;
	},
	measureElementWidthsFromAutomaticRow: function(mat) {
		var numDenoisingRows = 5, longestMmts = [],
			length = mat.length - numDenoisingRows;
		for(var y = 0; y < length; ++y) {
			var curMmts = this.measureElementWidthsFromRow(this.getDenoisedRowFromMatrix(mat, y, numDenoisingRows));
			if(curMmts.length > longestMmts.length) {
				longestMmts = curMmts;
			}
		}
		return longestMmts;
	},
	decodeImageFromAngle: function(img, angle) {
		var canvas = this.drawImageToCanvas(img, 512, 512, angle),
			mat = this.getMatrix(canvas);
		return this.decodeFromMmts(this.measureElementWidthsFromAutomaticRow(mat));
	},
	decodeImage: function(img) {
		for(var angle = 0; angle < 2 * Math.PI; angle += Math.PI / 18) {
			var result = this.decodeImageFromAngle(img, angle);
			if(result) {
				return result;
			}
		}
		return null;
	},
	decodeImageAsync: function(img, callback, angle) {
		var that = this;
		if(!angle) {
			angle = 0;
		}
		if(angle >= 2 * Math.PI) {
			callback(null);
			return;
		}
		var result = this.decodeImageFromAngle(img, angle);
		if(result) {
			callback(result);
			return;
		}
		setTimeout(function() {
			that.decodeImageAsync(img, callback, angle + Math.PI / 18);
		}, 0);
	}
};