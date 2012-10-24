/** @license
 * @author luwes / http://luwes.co
 * @version 3.0
 */

(function(jwplayer) {

	/**
	* Provides requestAnimationFrame in a cross browser way.
	* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	*/
	
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = (function() {
			return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout(callback, 1000 / 60);
			};
		})();
	}
	
	var main = function(player, config, div) {
				
		var _this = this;
		var playlist;
		
		var flow, textField;
		var datalist, indexMap;
		var animating = false;
		var rotateInterval;
		
		this.width = 0;
		this.height = 0;
		
		var slideSize = 0;

		var resizeDelay = true;
		var playerResized = false;
		
		var focusCallbacks = [];
		var clickCallbacks = [];
		var showCallbacks = [];
		var hideCallbacks = [];
			
		var defaultConfig = {
			size:					150,
			backgroundcolor:		'000000',
			gradientcolor:			undefined,
			coverwidth:				150,
			coverheight:			'auto',
			covergap:				40,
			coverangle:				70,
			coverdepth:				170,
			coveroffset:			130,
			removeblackborder:		false,
			fixedsize:				false,
			focallength:			250,
			opacitydecrease:		0.1,		//is not enabled, too slow on iOS
			reflectionopacity:		0.3,
			reflectionratio:		155,
			reflectionoffset:		0,
			showduration:			true,
			showtext:				true,
			textstyle:				'div#flow_textfield{color:#f1f1f1; text-align:center; font-family:Arial Rounded MT Bold;} #flow_textfield h1{font-size:14px; font-weight:normal; line-height:21px;} #flow_textfield h2{font-size:11px; font-weight:normal;}',
			textoffset:				75,
			tweentime:				0.8,
			rotatedelay:			0,
			dockicon:				true,
			onidle:					'show',
			onpaused:				'hide',
			onplaying:				'hide',
			oncompleted:			'show',
			file:					undefined,
			xposition:				0,
			yposition:				0
		};
	
		function setup(e) {
			if (player.getRenderingMode() != "html5") return;
		
			for (var prp in defaultConfig) {
				if (config[prp] === undefined) config[prp] = defaultConfig[prp];
			}
	
			var css = '.jwplayer_flow {overflow:hidden;-webkit-touch-callout:none;-webkit-text-size-adjust:none;-webkit-tap-highlight-color:rgba(0,0,0,0);opacity:1;-webkit-transition:opacity .7s;}' +
			'.jwplayer_flow div.flow_wrap {position:absolute;left:50%;top:50%;-webkit-perspective:250;-webkit-transform-style:preserve-3d;}' +
			'.jwplayer_flow div.flow_tray {-webkit-transform-style:preserve-3d;}' +
			'.jwplayer_flow div.flow_tray,.jwplayer_flow div.flow_cell {position:absolute;-webkit-transform:translate3d(0,0,0);-webkit-backface-visibility:hidden;-webkit-transition:-webkit-transform .8s cubic-bezier(0.190,1.000,0.220,1.000);}' +
			'.jwplayer_flow div.flow_cell canvas {position:absolute;opacity:1;-webkit-transition:opacity .7s;}' +
			'#flow_textfield {position:absolute;width:100%;opacity:1;-webkit-transition:opacity .7s;}' +
			'#flow_textfield h1,#flow_textfield h2{margin:0;}';

			var head = document.getElementsByTagName('head')[0];
			var element = document.createElement('style');
			var rules = config.textstyle;
			element.setAttribute("type", "text/css");
			element.appendChild(document.createTextNode(css));
			element.appendChild(document.createTextNode(rules));
			head.appendChild(element);
			
			div.className += "jwplayer_flow";
			div.addEventListener('webkitTransitionEnd', divTransitionEnd);
	
			slideSize = config.size;
			
			config.backgroundcolor = config.backgroundcolor.indexOf('#') == -1 ? "#" + config.backgroundcolor : config.backgroundcolor;
			div.style.backgroundColor = config.backgroundcolor;
			if (config.gradientcolor !== undefined) {
				config.gradientcolor = config.gradientcolor.indexOf('#') == -1 ? "#" + config.gradientcolor : config.gradientcolor;
				div.style.background = '-webkit-gradient(linear, left top, left bottom, from('+config.gradientcolor+'), to('+config.backgroundcolor+'))';
			}
	
			if (config.dockicon === true && typeof player.addButton === "function") {
				var dockIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAPCAYAAADgbT9oAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0Q3JlYXRpb24gVGltZQA2LzE4LzEx7HcX+AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAABCSURBVDiN7ZMxDgAgCAMP4/+/XAcjIQ4OBDduYeq1CyZJgFGLRrHQmbGFvVxJ18kawLfFLW5xix/El7brZvDst8ULHQsIIS+DTYcAAAAASUVORK5CYII=";
				player.addButton(dockIcon, 'Show Playlist', showOnDockButtonClick, 'flow');
			}
						
			player.onPlaylist(playlistHandler);
			player.onPlaylistItem(itemHandler);
			player.onPlay(stateHandler);
			player.onBuffer(stateHandler);
			player.onPause(stateHandler);
			player.onComplete(completeHandler);
			
			div.addEventListener('mousewheel', scrollOnMousewheel);
		}
		
		function scrollOnMousewheel(e) {
			e.preventDefault();
			
			var delta = Math.ceil(Math.abs(e.wheelDelta) / 120);
			if (delta > 0) {
				var sign = Math.abs(e.wheelDelta) / e.wheelDelta;
				var func = null;
				if (sign > 0) func = _this.left;
				else if (sign < 0) func = _this.right;
				if (typeof func === "function") {
					for (var i=0; i<delta; i++) func();
				}
			}
		}
		
		function showOnDockButtonClick() {
			// Update to support OVA
			if (!playlist[player.getCurrentItem()]['ova.hidden']) {
				player.pause(true);
				_this.show();
			}
		}
		
		function getVideoElement() {
			return player.getContainer().getElementsByTagName('video')[0];
		}
		
		function hideVideoElement() {
			if (getVideoElement()) {
				var t = getVideoElement().style.webkitTransform;
				if (t) {
					getVideoElement().style.webkitTransform = t.replace(/translate\(.+?\)/, 'translate(-'+_this.width+'px,-'+_this.height+'px)');
				} else {
					getVideoElement().style.webkitTransform = 'translate(-'+_this.width+'px,-'+_this.height+'px)';
				}
			}
		}
		
		function showVideoElement() {
			if (getVideoElement()) {
				var t = getVideoElement().style.webkitTransform;
				getVideoElement().style.webkitTransform = t.replace(/translate\(.+?\)/, 'translate(0px,0px)');
			}
		}
		
		function isPositioned() {
			return config.position == 'left' || config.position == 'right' ||
					config.position == 'top' || config.position == 'bottom';
		}
		
		function coverFocus(index) {
			if (config.showtext === true) {
				var d = datalist[index];
				if (d) {
					textField.innerHTML = "<h1>" + (d.title === undefined ? "" : d.title) + "</h1><h2>" + (d.description === undefined ? "" : d.description) + "</h2>";
				}
			}
			
			for (var i=0; i<focusCallbacks.length; i++) {
				focusCallbacks[i](index);
			}
		}
	
		function coverClick(index) {
			if (config.rotatedelay > 0 && rotateInterval) { _this.stopRotation(); }
	
			if (config.file === undefined) {
				if (indexMap[index] != player.getCurrentItem()) player.playlistItem(indexMap[index]);
				else if (player.getState() == 'PLAYING') player.pause(true);
				else player.play(true);
			} else {
				if (datalist[index].link) window.open(datalist[index].link, player.config.linktarget);
				if (datalist[index].file) {
					player.load({file: datalist[index].file, image: datalist[index].image});
					player.play();
				}
			}
			
			for (var i=0; i<clickCallbacks.length; i++) {
				clickCallbacks[i](index);
			}
		}
		
		function divTransitionEnd(e) {
			if (e.target == div) {
				if (parseInt(div.style.opacity, 10) === 0) {
					hideComplete();
				} else {
					showFlow();
				}
			}
		}
		
		function tweenResize() {
			playerResized = false;
			_this.resize();
		}
		
		function hideInternal() {
			if (animating || getVisible() === false) return;
			animating = true;
			
			if (isPositioned()) {
				new TWEEN.Tween(config).to({ size: 0 }, 400)
					.easing(TWEEN.Easing.Cubic.EaseOut)
					.onUpdate(tweenResize).onComplete(hideComplete)
					.start();
			} else {
				setTimeout(function() {
					if (config.showtext === true) {
						textField.style.opacity = 0;
					}
					flow.hide(hideBack);
				}, 100);

				showVideoElement();
			}
			
			for (var i = 0; i < hideCallbacks.length; i++) {
				hideCallbacks[i]();
			}
		}
		
		function hideBack() {
			div.style.opacity = 0;
		}
		
		function hideComplete() {
			setVisible(false);
			animating = false;
		}
		
		function showInternal() {
			if (animating || getVisible() === true) return;
			animating = true;
			
			setVisible(true);
			
			if (isPositioned()) {
				config.size = 1;
				tweenResize();
				new TWEEN.Tween(config).to({ size: slideSize }, 400)
					.easing(TWEEN.Easing.Cubic.EaseOut)
					.onUpdate(tweenResize).onComplete(showComplete)
					.start();
			} else {
				setTimeout(function() { div.style.opacity = 1; }, 100);
			}
			
			for (var i = 0; i < showCallbacks.length; i++) {
				showCallbacks[i]();
			}
		}
		
		function showFlow() {
			if (config.showtext === true) {
				textField.style.opacity = 1;
			}
			flow.show(showComplete);
		}
		
		function showComplete() {
			animating = false;
			if (!isPositioned()) {
				hideVideoElement();
			}
		}
		
		function playlistHandler(data) {
			playlist = data.playlist;
			
			config.coverheight = config.coverheight == "auto" ? player.config.height : config.coverheight;
			
			if (config.file === undefined) {
			
				datalist = [];
				indexMap = [];
						
				var count = 0;
				for (var i = 0; i < playlist.length; i++) {
					// Update to support OVA
					var itm = playlist[i];
					if (!itm['ova.hidden'] && itm.image) {
						datalist[count] = {title: itm.title, description: itm.description};
						datalist[count].image = itm.image;
						if (config.showduration) {
							datalist[count].duration = itm.duration;
						}
						indexMap[count] = i;
						count++;
					}
				}
				
				if (flow) flow.destroy();
				flow = new Flow(div, datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
								config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
								config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
				div.appendChild(flow.domElement);
				afterFlow();
			} else {
				jwplayer.utils.ajax(config.file, relatedComplete);
			}
		}
		
		function relatedComplete(g) {
			try {
				var playlistItems = jwplayer.utils.parsers.rssparser.parse(g.responseXML.firstChild);
				if (playlistItems.length > 0) {
					relatedHandler(playlistItems);
				}
			} catch(h) {}
		}
		
		function relatedHandler(itemList) {
		
			datalist = [];
	
			for (var i=0; i<itemList.length; i++) {
				var itm = itemList[i];
				datalist[i] = {title: itm.title, description: itm.description, link: itm.link, file: itm.file};
				datalist[i].image = itm.image;
				if (config.showduration) {
					datalist[i].duration = itm.duration;
				}
			}
			
			if (flow) flow.destroy();
			flow = new Flow(div, datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
							config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
							config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
			div.appendChild(flow.domElement);
			afterFlow();
			flow.to(0);
		}
		
		function afterFlow() {
		
			flow.onFocus(coverFocus);
			flow.onClick(coverClick);
			
			if (textField) div.removeChild(textField);
			if (config.showtext === true) {
				textField = document.createElement("div");
				textField.setAttribute('id', 'flow_textfield');
				div.appendChild(textField);
			}
			
			_this.resize();
			itemHandler();
			
			div.style.display = 'block';
			if (config.onidle == 'hide') {
				div.style.display = 'none';
				setVisible(false);
				div.style.opacity = 0;
				flow.hide(null);
				textField.style.opacity = 0;
			}
	
			if (config.rotatedelay > 0) {
				if (rotateInterval) _this.stopRotation();
				rotateInterval = setInterval(rotateHandler, config.rotatedelay);
				div.addEventListener('touchstart', _this.stopRotation, false);
				div.addEventListener('mousedown', _this.stopRotation, false);
			}
			
			animating = false;
			if (config.file !== undefined) {
				if (player.getState() == 'PLAYING' || player.getState() == 'BUFFERING') {
					if (config.onplaying == 'show') _this.show();
					else if (config.onplaying == 'hide') _this.hide();
				}
			}
		}
		
		function itemHandler(data) {
			// Update to support OVA
			if (playlist[player.getCurrentItem()]['ova.hidden']) {
				// hide plugin when an ad is shown
				_this.hide();
			} else if (config.file === undefined) {
				// use indexMap to resolve the correct cover index
				flow.to(indexMap.indexOf(player.getCurrentItem()));
			}
		}
		
		function completeHandler(data) {
			if (config.oncompleted == 'show') _this.show();
			else if (config.oncompleted == 'hide') _this.hide();
		}
		
		function stateHandler(data) {
		
			switch (player.getState()) {
				case 'PAUSED':
					if (config.onpaused == 'show') _this.show();
					else if (config.onpaused == 'hide') _this.hide();
					break;
				case 'BUFFERING':
				case 'PLAYING':
					if (config.onplaying == 'show') _this.show();
					else if (config.onplaying == 'hide') _this.hide();
					break;
			}
		}
		
		function getVisible() {
			return div.style.display != 'none';
		}
		
		function setVisible(bool) {
			if (bool) {
				div.style.display = 'block';
			} else {
				div.style.display = 'none';
			}
		}
		
		player.onReady(setup);
		
		this.stopRotation = function() {
			div.removeEventListener('touchstart', _this.stopRotation, false);
			div.removeEventListener('mousedown', _this.stopRotation, false);
			clearInterval(rotateInterval);
		};
			
		function rotateHandler() {
			flow.next();
		}
			
		//public for other plugins to make use of
		this.left = function() {
			if (player.getRenderingMode() == "html5") {
				flow.left();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowLeft();
			}
		};
		this.right = function() {
			if (player.getRenderingMode() == "html5") {
				flow.right();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowRight();
			}
		};
		this.prev = function() {
			if (player.getRenderingMode() == "html5") {
				flow.prev();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowPrev();
			}
		};
		this.next = function() {
			if (player.getRenderingMode() == "html5") {
				flow.next();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowNext();
			}
		};
		this.to = function(index) {
			if (player.getRenderingMode() == "html5") {
				flow.to(index);
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowTo(index);
			}
		};
		this.onFocus = function(c) {
			if (player.getRenderingMode() == "html5") {
				focusCallbacks.push(c);
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowOnFocus(c.toString());
			}
		};
		this.onClick = function(c) {
			if (player.getRenderingMode() == "html5") {
				clickCallbacks.push(c);
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowOnClick(c.toString());
			}
		};
		
		this.hide = function() {
			if (player.getRenderingMode() == "html5") {
				hideInternal();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowHide();
			}
		};
		this.show = function() {
			if (player.getRenderingMode() == "html5") {
				showInternal();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowShow();
			}
		};
		this.onHide = function(c) {
			if (player.getRenderingMode() == "html5") {
				hideCallbacks.push(c);
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowOnHide(c.toString());
			}
		};
		this.onShow = function(c) {
			if (player.getRenderingMode() == "html5") {
				showCallbacks.push(c);
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowOnShow(c.toString());
			}
		};
		
		this.getDisplayElement = function() {
			return div;
		};

		function playerResize(wid, hei) {
			if (!playerResized) {
				playerResized = true;
				//jw6 requires a delay at page load for the player to resize correctly
				if (resizeDelay) {
					resizeDelay = false;
					setTimeout(function() {
						player.resize(wid, hei);
					}, 0);
				} else {
					player.resize(wid, hei);
				}
			}
		}
		
		this.resize = function(wid, hei) {

			if (player.getRenderingMode() == "html5") {
			
				if (wid) _this.width = wid;
				if (hei) _this.height = hei;
				
				var flowWidth = _this.width;
				var flowHeight = _this.height;
				
				if (isPositioned() && config.size > 0) {
					if (config.position == 'left' || config.position == 'right') {
						flowWidth = config.size;
						flowHeight = player.config.height;
						playerResize(player.config.width-flowWidth, player.config.height);
						div.style[config.position] = -config.size + 'px';
					} else if (config.position == 'top' || config.position == 'bottom') {
						flowWidth = player.config.width;
						flowHeight = config.size;
						playerResize(player.config.width, player.config.height-flowHeight);
						if (config.position == 'top') {
							div.style.top = -flowHeight + 'px';
						} else if (config.position == 'bottom') {
							div.style.top = (player.config.height-flowHeight) + 'px';
						}
					}
					player.getContainer().style['margin'+firstToUpperCase(config.position)] = config.size + 'px';
				}
				
				div.style.width = flowWidth + "px";
				div.style.height = flowHeight + "px";
		
				if (flow) {
					flow.domElement.style.left = (flowWidth * 0.5 + config.xposition) + "px";
					flow.domElement.style.top = (flowHeight * 0.5 + config.yposition) + "px";
				}
		
				if (textField) {
					textField.style.top = (flowHeight - config.textoffset) + "px";
				}
			} else {
				if (div.parentNode) {
					div.parentNode.removeChild(div);
				}
			}
		};
		
		function firstToUpperCase(str) {
			return str.substr(0, 1).toUpperCase() + str.substr(1);
		}
		
		function animate() {
			window.requestAnimationFrame(animate);
			TWEEN.update();
		}
		animate();
	};
	
	/*-------------------------Flow-------------------------*/
	
	Flow = function(div, playlist, wid, hei, gap, angle, depth, offset,
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
		this.domElement.setAttribute('id', 'flow_wrap');
		this.domElement.setAttribute('class', 'flow_wrap');
		var tray = document.createElement('div');
		tray.setAttribute('id', 'flow_tray');
		tray.setAttribute('class', 'flow_tray');
		this.domElement.appendChild(tray);
		
		this.domElement.style.webkitPerspective = focalLength;
		
		var delegate = new FlowDelegate(this, tray);
		var controller = new TouchController(this, delegate, tray);
		var cover = null;

		for (var i=0; i<playlist.length; i++) {
			
			cover = new FlowItem(_this, i, playlist[i].image, playlist[i].duration, wid, hei, reflectOpacity,
									reflectRatio, reflectOffset, backColor, removeBlackBorder, fixedSize);
	
			delegate.cells.push(cover);
			tray.appendChild(cover.domElement);
			cover.domElement.onmousedown = clickHandler;
			cover.domElement.style.webkitTransitionDuration = duration + "s";
			covers[i] = cover;
		}
		//cover holds the last cover added
		cover.domElement.firstChild.addEventListener('webkitTransitionEnd', coverTransitionEnd, true);
		
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

			for (var i=0; i<covers.length; i++) {
				covers[i].domElement.firstChild.style.opacity = 0;
			}
		};
		
		this.show = function(callback) {
			_this.showComplete = callback;
			_this.domElement.style.opacity = 1;
			for (var i=0; i<covers.length; i++) {
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
			for (var i=0; i<focusCallbacks.length; i++) {
				focusCallbacks[i](index);
			}
		};
		
		this.clicked = function(index) {
			for (var i=0; i<clickCallbacks.length; i++) {
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
			var i = 0, child = e.currentTarget;
			while (child = child.previousSibling) ++i;
			var flowItem = covers[i];
			if (e.offsetY < flowItem.halfHeight) {
				e.preventDefault();
	
				if (flowItem.index != current) _this.to(flowItem.index);
				else _this.clicked(flowItem.index);
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
	
	/*-------------------------FlowItem-------------------------*/
	
	FlowItem = function(flow, index, url, duration, coverWidth, coverHeight, reflectOpacity,
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
		_this.domElement.appendChild(bitmap);
	
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
	
	FlowItem.prototype.reflect = function(bitmap, wid, hei, reflectOpacity, reflectRatio, reflectOffset) {
	
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
	
	/*-------------------------TouchController-------------------------*/
	
	TouchController = function(flow, delegate, elem) {
		this.flow = flow;
		this.delegate = delegate;
		this.elem = elem;
		
		this.currentX = 0;
	};
	
	TouchController.prototype.touchstart = function(e) {
		e.stopImmediatePropagation();
		this.startX = e.touches[0].pageX - this.currentX;
		this.pageY = e.touches[0].pageY;
		this.touchMoved = false;
		window.addEventListener("touchmove", this, true);
		window.addEventListener("touchend", this, true);
		this.elem.style.webkitTransitionDuration = "0s";
	};
	
	TouchController.prototype.touchmove = function(e) {
		e.stopImmediatePropagation();
		this.touchMoved = true;
		this.lastX = this.currentX;
		this.lastMoveTime = new Date().getTime();
		this.currentX = e.touches[0].pageX - this.startX;
		this.delegate.update(this.currentX);
	};
	
	TouchController.prototype.touchend = function(e) {
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
	
	TouchController.prototype.to = function(index) {
		this.currentX = -index * this.delegate.flow.GAP;
		this.delegate.update(this.currentX);
	};
	
	TouchController.prototype.handleEvent = function(e) {
		this[e.type](e);
		e.preventDefault();
	};
	
	/*-------------------------FlowDelegate-------------------------*/
	
	FlowDelegate = function(flow, elem) {
		this.flow = flow;
		this.elem = elem;
		
		this.cells = [];
		this.transforms = [];
		
		this.prevF = -1;
	};
	
	FlowDelegate.prototype.updateTouchEnd = function(controller) {
		var i = this.getFocusedCell(controller.currentX);
		controller.currentX = -i * this.flow.GAP;
		this.update(controller.currentX);
	};
	
	FlowDelegate.prototype.getFocusedCell = function(currentX) {
		var i = -Math.round(currentX / this.flow.GAP);
		return Math.min(Math.max(i, 0), this.cells.length - 1);
	};
	
	FlowDelegate.prototype.getFocusedCellOne = function(currentX) {
		var i = -Math.round(currentX / this.flow.GAP);
		return Math.min(Math.max(i, -1), this.cells.length);
	};
	
	FlowDelegate.prototype.click = function(e, pageY, currentX) {
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
	
	FlowDelegate.prototype.findPos = function(obj) {
		var curleft = 0;
		var curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
			return { x: curleft, y: curtop };
		}
	};
	
	FlowDelegate.prototype.setStyleForCell = function(cell, i, transform) {
		if (this.transforms[i] != transform) {
			cell.domElement.style.webkitTransform = transform;
			this.transforms[i] = transform;
		}
	};
	
	FlowDelegate.prototype.transformForCell = function(f, i, offset) {
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
	
	FlowDelegate.prototype.update = function(currentX) {
		this.elem.style.webkitTransform = "translate3d(" + (currentX) + "px, 0, 0)";
		/*
			It would be nice if we only updated dirty cells... for now, we use a cache
		*/
		var f = this.getFocusedCellOne(currentX);
		if (f != this.prevF) {
			this.flow.focused(f);
			for (var i=0; i<this.cells.length; i++) {
				if (i < f) {
					this.cells[i].domElement.style.zIndex = i;
				} else {
					this.cells[i].domElement.style.zIndex = this.cells.length-i+f-1;
				}
			}
			this.prevF = f;
		}
		
		for (var j=0; j<this.cells.length; j++) {
			this.setStyleForCell(this.cells[j], j, this.transformForCell(f, j, currentX));
		}
	};
	
	jwplayer().registerPlugin('flow', '6.0', main, './flow.swf');
	
})(jwplayer);
