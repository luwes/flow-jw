(function(C) {

	C.Delegate = function(flow, elem) {
		this.flow = flow;
		this.elem = elem;
		
		this.cells = [];
		this.transforms = [];
		
		this.prevF = -1;
		this.transformProp = Modernizr.prefixed('transform');
	};

	C.Delegate.prototype.updateTouchEnd = function(controller) {
		var i = this.getFocusedCell(controller.currentX);
		controller.currentX = -i * this.flow.GAP;
		this.update(controller.currentX);
	};

	C.Delegate.prototype.getFocusedCell = function(currentX) {
		var i = -Math.round(currentX / this.flow.GAP);
		return Math.min(Math.max(i, 0), this.cells.length - 1);
	};

	C.Delegate.prototype.getFocusedCellOne = function(currentX) {
		var i = -Math.round(currentX / this.flow.GAP);
		return Math.min(Math.max(i, -1), this.cells.length);
	};

	C.Delegate.prototype.click = function(e, pageY, currentX) {
		var i = -Math.round(currentX / this.flow.GAP);
		var cell = this.cells[i];
		if (cell.domElement == e.target.parentNode) {
			var pos = this.findPos(cell.domElement);
			var y = pageY - pos.y;
			if (y < cell.halfHeight) {
				this.flow.clicked(cell.index);
			}
		}
	};

	C.Delegate.prototype.findPos = function(obj) {
		var curleft = 0;
		var curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;

			} while ((obj = obj.offsetParent) !== null);

			return { x: curleft, y: curtop };
		}
	};

	C.Delegate.prototype.setStyleForCell = function(cell, i, transform) {
		if (this.transforms[i] != transform) {
			cell.domElement.style[this.transformProp] = transform;
			this.transforms[i] = transform;
		}
	};

	C.Delegate.prototype.transformForCell = function(f, i, offset) {
		/*
			This function needs to be fast, so we avoid function calls, divides, Math.round,
			and precalculate any invariants we can.
		*/
		var x = (i * this.flow.GAP);
		if (f == i) {
			return "translate3d(" + x + "px, 0, 0)";
		} else if (i > f) {
			return "translate3d(" + (x + this.flow.OFFSET) + "px, 0, " + this.flow.DEPTH + "px) " + this.flow.T_NEG_ANGLE;
		} else {
			return "translate3d(" + (x - this.flow.OFFSET) + "px, 0, " + this.flow.DEPTH + "px) " + this.flow.T_ANGLE;
		}
	};

	C.Delegate.prototype.update = function(currentX) {
		this.elem.style[this.transformProp] = "translate3d(" + (currentX) + "px, 0, 0)";
		/*
			It would be nice if we only updated dirty cells... for now, we use a cache
		*/
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
