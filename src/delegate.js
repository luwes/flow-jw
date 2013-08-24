(function(C) {

	C.Delegate = function(flow, elem, config) {
		this.flow = flow;
		this.elem = elem;
		this.config = config;
		
		this.cells = [];
		this.transforms = [];
		
		this.prevF = -1;
		this.transformProp = Modernizr.prefixed('transform');
	};

	C.Delegate.prototype.updateTouchEnd = function(controller) {
		var i = this.getFocusedCell(controller.currentX);
		controller.currentX = -i * this.config.covergap;
		this.update(controller.currentX);
	};

	C.Delegate.prototype.getFocusedCell = function(currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		return Math.min(Math.max(i, 0), this.cells.length - 1);
	};

	C.Delegate.prototype.getFocusedCellOne = function(currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		return Math.min(Math.max(i, -1), this.cells.length);
	};

	C.Delegate.prototype.click = function(e, pageY, currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		var cell = this.cells[i];
		if (cell.domElement == e.target.parentNode) {
			if (pageY < this.offsetY + cell.halfHeight / 2) {
				this.flow.clicked(cell.index);
			}
		}
	};

	C.Delegate.prototype.setTrayStyle = function(x, y) {
		this.elem.style[this.transformProp] = "translate3d(" + x + "px, " + y + "px, 0)";
	};

	C.Delegate.prototype.setStyleForCell = function(cell, i, transform) {
		if (this.transforms[i] != transform) {
			cell.domElement.style[this.transformProp] = transform;
			this.transforms[i] = transform;
		}
	};

	C.Delegate.prototype.transformForCell = function(f, i, offset) {
		var x = (i * this.config.covergap);
		if (f == i) {
			return "translate3d(" + x + "px, 0, 0)";
		} else if (i > f) {
			return "translate3d(" + (x + this.flow.OFFSET) + "px, 0, " + (-this.config.coverdepth) + "px) " + this.flow.T_NEG_ANGLE;
		} else {
			return "translate3d(" + (x - this.flow.OFFSET) + "px, 0, " + (-this.config.coverdepth) + "px) " + this.flow.T_ANGLE;
		}
	};

	C.Delegate.prototype.update = function(currentX) {
		this.setTrayStyle((currentX + this.offsetX), this.offsetY);

		var f = this.getFocusedCellOne(currentX);
		if (f != this.prevF) {
			this.flow.focused(f);
			this.prevF = f;
		}
		
		for (var j = 0; j < this.cells.length; j++) {
			this.setStyleForCell(this.cells[j], j, this.transformForCell(f, j, currentX));
		}
	};

})(window.flow);
