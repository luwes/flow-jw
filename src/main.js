/** @license
 * @author luwes / http://luwes.co
 * @version 3.0
 */

(function(jwplayer, C) {

	C.flow = {};	//flow namespace
	C = C.flow;		//reset C(Class)

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

	var scripts = document.getElementsByTagName("head")[0].getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		var match = scripts[i].src.match(/(.*?)flow-?\d?\.js/);
		if (match) {
			var mydir = match[1];
			break;
		}
	}
	
	C.Flow = function(player, config, div) {

		var _this = this;
		var playlist;
		
		var coverflow, textField;
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
			element.appendChild(document.createTextNode(css));
			element.appendChild(document.createTextNode(config.textstyle));
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
			
			for (var i = 0; i < focusCallbacks.length; i++) {
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
			
			for (var i = 0; i < clickCallbacks.length; i++) {
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
					coverflow.hide(hideBack);
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
			coverflow.show(showComplete);
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
				
				if (coverflow) coverflow.destroy();
				coverflow = new C.CoverFlow(div, datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
								config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
								config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
				div.appendChild(coverflow.domElement);
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
	
			for (var i = 0; i < itemList.length; i++) {
				var itm = itemList[i];
				datalist[i] = {title: itm.title, description: itm.description, link: itm.link, file: itm.file};
				datalist[i].image = itm.image;
				if (config.showduration) {
					datalist[i].duration = itm.duration;
				}
			}
			
			if (coverflow) coverflow.destroy();
			coverflow = new C.CoverFlow(div, datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
							config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
							config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
			div.appendChild(coverflow.domElement);
			afterFlow();
			coverflow.to(0);
		}
		
		function afterFlow() {
		
			coverflow.onFocus(coverFocus);
			coverflow.onClick(coverClick);
			
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
				coverflow.hide(null);
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
				coverflow.to(indexMap.indexOf(player.getCurrentItem()));
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
			coverflow.next();
		}
			
		//public for other plugins to make use of
		this.left = function() {
			if (player.getRenderingMode() == "html5") {
				coverflow.left();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowLeft();
			}
		};
		this.right = function() {
			if (player.getRenderingMode() == "html5") {
				coverflow.right();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowRight();
			}
		};
		this.prev = function() {
			if (player.getRenderingMode() == "html5") {
				coverflow.prev();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowPrev();
			}
		};
		this.next = function() {
			if (player.getRenderingMode() == "html5") {
				coverflow.next();
			} else if (player.getRenderingMode() == "flash") {
				player.getContainer().flowNext();
			}
		};
		this.to = function(index) {
			if (player.getRenderingMode() == "html5") {
				coverflow.to(index);
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
		
				if (coverflow) {
					coverflow.domElement.style.left = (flowWidth * 0.5 + config.xposition) + "px";
					coverflow.domElement.style.top = (flowHeight * 0.5 + config.yposition) + "px";
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
	
	jwplayer().registerPlugin('flow', '6.0', C.Flow, './flow.swf');
	
})(jwplayer, window);
