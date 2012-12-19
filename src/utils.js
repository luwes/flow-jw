(function(C) {
	
	C.Utils = function() {
	};

	C.Utils.hasFlash = ((typeof navigator.plugins != "undefined" &&
		typeof navigator.plugins["Shockwave Flash"] == "object") ||
		(window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) !== false));

	C.Utils.isIE = navigator.userAgent.match(/msie/i) !== null;
	
	C.Utils.css = function(element, props) {
		if (element) {
			for (var key in props) {
				if (typeof props[key] === "undefined") {
					continue;
				} else if (typeof props[key] == "number" && !(key == "zIndex" || key == "opacity")) {
					if (isNaN(props[key])) {
						continue;
					}
					props[key] = Math.ceil(props[key]) + "px";
				}
				try {
					element.style[key] = props[key];
				} catch (e) {}
			}
		}
	};

	C.Utils.addClass = function(element, classname) {
		if (element.className.indexOf(classname) === -1) {
			element.className += " " + classname;
		}
	};
	
})(window);


if (!Array.indexOf) {
	Array.prototype.indexOf = function(obj) {
		for (var i=0; i<this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	};
}
