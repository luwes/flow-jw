(function(C) {

	C.CoverFlow = function(div, playlist, wid, hei, gap, angle, depth, offset,
					opacity, backColor, reflectOpacity, reflectRatio, reflectOffset,
					removeBlackBorder, fixedSize, duration, focalLength) {
		
		var _this = this;
		
		this.GAP = gap;
		this.ANGLE = angle;
		this.DEPTH = -depth;
		this.OFFSET = offset + gap;
		this.T_NEG_ANGLE = "rotateY(" + (-this.ANGLE) + "deg)";
		this.T_ANGLE = "rotateY(" + this.ANGLE + "deg)";
		this.OPACITY = opacity;
		this.DURATION = duration;
		
		this.hideComplete = null;
		this.showComplete = null;
		
		var covers = [];
		var coversLength = playlist.length;
		var completeLength = 0;
		var maxCoverHeight = 0;
		var current = 0;
		
		var focusCallbacks = [];
		var clickCallbacks = [];
		
		
		this.domElement = document.createElement('div');
		this.domElement.className = "flow_wrap";
		var tray = document.createElement('div');
		tray.className = "flow_tray";
		this.domElement.appendChild(tray);
		
		this.domElement.style[Modernizr.prefixed('perspective')] = focalLength+"px";
		
		var delegate = new C.Delegate(this, tray);
		var controller = new C.TouchController(this, delegate, tray);
		var cover = null;

		for (var i = 0; i < playlist.length; i++) {
			
			cover = new C.Cover(this, i, playlist[i].image, playlist[i].duration, wid, hei, reflectOpacity,
									reflectRatio, reflectOffset, backColor, removeBlackBorder, fixedSize);

			delegate.cells.push(cover);
			tray.appendChild(cover.domElement);
			cover.domElement.onmousedown = clickHandler;
			cover.domElement.style[Modernizr.prefixed('transitionDuration')] = duration + "s";
			covers[i] = cover;
		}
		//cover holds the last cover added
		cover.domElement.firstChild.addEventListener(C.Utils.getTransEndEventName(), coverTransitionEnd, true);
		

		function coverTransitionEnd(e) {
			e.stopPropagation();

			if (parseInt(cover.domElement.firstChild.style.opacity, 10) === 0) {
				_this.domElement.style.opacity = 0;
				if (typeof _this.hideComplete == 'function') _this.hideComplete();
			} else if (parseInt(cover.domElement.firstChild.style.opacity, 10) === 1) {
				if (typeof _this.showComplete == 'function') _this.showComplete();
			}
		}
		
		this.hide = function(callback) {
			_this.hideComplete = callback;
			for (var i = 0; i < covers.length; i++) {
				covers[i].domElement.firstChild.style.opacity = 0;
			}
		};
		
		this.show = function(callback) {
			_this.showComplete = callback;
			_this.domElement.style.opacity = 1;
			for (var i = 0; i < covers.length; i++) {
				covers[i].domElement.firstChild.style.opacity = 1;
			}
		};

		this.itemComplete = function(h) {
			maxCoverHeight = maxCoverHeight < h ? h : maxCoverHeight;
			++completeLength;
			if (completeLength == coversLength) {
				_this.to(0);
				for (var i = 0; i < coversLength; i++) {
					covers[i].setY(maxCoverHeight);
				}
			}
		};

		this.left = function() {
			if (current > 0) _this.to(current - 1);
		};
			
		this.right = function() {
			if (current < coversLength - 1) _this.to(current + 1);
		};
		
		this.prev = function() {
			if (current > 0) _this.to(current - 1);
			else _this.to(coversLength - 1);
		};
		
		this.next = function() {
			if (current < coversLength - 1) _this.to(current + 1);
			else _this.to(0);
		};
		
		this.to = function(index) {
			if (index > coversLength - 1) index = coversLength - 1;
			else if (index < 0) index = 0;
						
			current = index;
			controller.to(index);
		};
		
		this.focused = function(index) {
			for (var i = 0; i < focusCallbacks.length; i++) {
				focusCallbacks[i](index);
			}
		};
		
		this.clicked = function(index) {
			for (var i = 0; i < clickCallbacks.length; i++) {
				clickCallbacks[i](index);
			}
		};
		
		this.onFocus = function(c) {
			focusCallbacks.push(c);
		};
		
		this.onClick = function(c) {
			clickCallbacks.push(c);
		};
		
		this.destroy = function() {
			div.removeChild(_this.domElement);
			
			div.removeEventListener('touchstart', controller, true);
			window.removeEventListener('keydown', keyboard, false);
		};
		
		function clickHandler(e) {
			var child = this;
			var i = 0;

			while ((child = child.previousSibling) !== null) ++i;

			var cover = covers[i];
			var y = e.offsetY || e.layerY;
			if (y < cover.halfHeight) {
				e.preventDefault();

				if (cover.index != current) _this.to(cover.index);
				else _this.clicked(cover.index);
			}
		}

		div.addEventListener('touchstart', controller, true);
		window.addEventListener('keydown', keyboard, false);
		function keyboard(e) {
			switch (e.keyCode) {
				case 37: _this.left(); break;
				case 39: _this.right(); break;
				case 38: _this.to(0); break;
				case 40: _this.to(coversLength - 1); break;
				case 32: _this.clicked(current); break;
			}
		}
	};

})(window.flow);

