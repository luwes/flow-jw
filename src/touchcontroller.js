(function(C) {

	C.TouchController = function(flow, delegate, elem) {
		this.flow = flow;
		this.delegate = delegate;
		this.elem = elem;
		
		this.currentX = 0;
	};

	C.TouchController.prototype.touchstart = function(e) {
		e.stopImmediatePropagation();
		this.startX = e.touches[0].pageX - this.currentX;
		this.pageY = e.touches[0].pageY;
		this.touchMoved = false;
		window.addEventListener("touchmove", this, true);
		window.addEventListener("touchend", this, true);
		this.elem.style.webkitTransitionDuration = "0s";
	};

	C.TouchController.prototype.touchmove = function(e) {
		e.stopImmediatePropagation();
		this.touchMoved = true;
		this.lastX = this.currentX;
		this.lastMoveTime = new Date().getTime();
		this.currentX = e.touches[0].pageX - this.startX;
		this.delegate.update(this.currentX);
	};

	C.TouchController.prototype.touchend = function(e) {
		e.stopImmediatePropagation();
		window.removeEventListener("touchmove", this, true);
		window.removeEventListener("touchend", this, true);

		this.elem.style.webkitTransitionDuration = this.flow.DURATION + "s";

		if (this.touchMoved) {
			/* Approximate some inertia -- the transition function takes care of the decay over 0.4s for us, but we need to amplify the last movement */
			var delta = this.currentX - this.lastX;
			var dt = new Date().getTime() - this.lastMoveTime + 1;
			
			this.currentX = this.currentX + delta * 50 / dt;
			this.delegate.updateTouchEnd(this);
		} else {
			this.delegate.click(e, this.pageY, this.currentX);
		}
	};

	C.TouchController.prototype.to = function(index) {
		this.currentX = -index * this.delegate.flow.GAP;
		this.delegate.update(this.currentX);
	};

	C.TouchController.prototype.handleEvent = function(e) {
		this[e.type](e);
		e.preventDefault();
	};

})(window);
