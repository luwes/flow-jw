(function(C) {

	C.Cover = function(flow, index, url, duration, coverWidth, coverHeight, reflectOpacity,
						reflectRatio, reflectOffset, backColor, removeBlackBorder, fixedSize) {

		var _this = this;
		
		var newWidth;
		var newHeight;
		
		this.index = index;
		this.halfHeight = 0;
		
		this.domElement = document.createElement("div");
		this.domElement.className = "flow_cell";
		var cellStyle = this.domElement.style;
		cellStyle.backgroundColor = backColor;
		
		var bitmap = document.createElement("canvas");
		this.domElement.appendChild(bitmap);

		var image = document.createElement("img");
		image.addEventListener("load", onComplete);
		image.src = url;
		
		function onComplete() {

			var wid = image.width;
			var hei = image.height;
				
			var cropTop = 0;
			var cropBottom = 0;
			var cropLeft = 0;
				
			// algorithm to remove top and bottom black border of thumbnail
			if (removeBlackBorder) {
			
				var b = document.createElement("canvas");
				b.width = wid;
				b.height = hei;
				var ctx = b.getContext('2d');
				ctx.drawImage(image, 0, 0);
				var bmd = ctx.getImageData(0, 0, wid, hei).data;
				
				var sum = 0;
				var x = 0;
				var i = 0;

				for (var y=0; y < hei; y++) {
					sum = 0;
					for (x=0; x < wid; x++) {
						i = (y * wid + x) * 4;
						sum += ((bmd[i] << 16) | (bmd[i+1] << 8) | bmd[i+2]);
					}
					if (sum/wid < 0x070707) cropTop++;
					else break;
				}
				
				for (y=hei-1; y>=0; y--) {
					sum = 0;
					for (x=0; x < wid; x++) {
						i = (y * wid + x) * 4;
						sum += ((bmd[i] << 16) | (bmd[i+1] << 8) | bmd[i+2]);
					}
					
					if (sum/wid < 0x070707) cropBottom++;
					else break;
				}
				
				hei -= (cropTop + cropBottom);
			}
						
			var scale;
			// calculate the image size, ratio values
			if (fixedSize) {
				newWidth = Math.round(coverWidth);
				newHeight = Math.round(coverHeight);
				if (newWidth / wid < newHeight / hei) {
					scale = newHeight / hei;
					cropLeft += (wid - newWidth / scale) * 0.5;
				} else {
					scale = newWidth / wid;
					cropTop += (hei - newHeight / scale) * 0.5;
				}
			} else {
				if (coverWidth >= coverHeight) {
					newWidth = Math.round(wid / hei * coverHeight);
					newHeight = Math.round(coverHeight);
					scale = coverHeight / hei;
				} else {
					newWidth = Math.round(coverWidth);
					newHeight = Math.round(hei / wid * coverWidth);
					scale = coverWidth / wid;
				}
			}
			
			_this.halfHeight = newHeight;
			
			cellStyle.top = -(newHeight * 0.5) + "px";
			cellStyle.left = -(newWidth * 0.5) + "px";
			cellStyle.width = (newWidth) + "px";
			cellStyle.height = (newHeight) + "px";

			bitmap.width = newWidth;
			bitmap.height = newHeight * 2;
			var bitmapCtx = bitmap.getContext('2d');
			bitmapCtx.drawImage(image, cropLeft, cropTop, wid-2*cropLeft, hei-2*cropTop, 0, 0, newWidth, newHeight);

			if (reflectOpacity > 0) {
				cellStyle.height = (newHeight * 2) + "px";
				_this.reflect(bitmap, newWidth, newHeight, reflectOpacity, reflectRatio, reflectOffset);
			}
		
			flow.itemComplete(newHeight);
		}
		
		this.setY = function(maxCoverHeight) {
			var offsetY = maxCoverHeight * 0.5 - (maxCoverHeight - newHeight);
			this.domElement.style.top = -offsetY + "px";
		};
	};

	C.Cover.prototype.reflect = function(bitmap, wid, hei, reflectOpacity, reflectRatio, reflectOffset) {

		var ctx = bitmap.getContext("2d");
		ctx.save();
		ctx.scale(1, -1);
		ctx.drawImage(bitmap, 0, -hei*2 - reflectOffset);
		ctx.restore();
		ctx.globalCompositeOperation = "destination-out";

		var gradient = ctx.createLinearGradient(0, 0, 0, hei);
		gradient.addColorStop(reflectRatio/255, "rgba(255, 255, 255, 1.0)");
		gradient.addColorStop(0, "rgba(255, 255, 255, " + (1 - reflectOpacity) + ")");
		ctx.translate(0, hei + reflectOffset);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, wid, hei);
	};

})(window);
