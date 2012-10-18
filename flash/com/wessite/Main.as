/**
* Flow 1.0 by Wesley Luyten. Oct 21, 2009
* Flow 1.1 by Wesley Luyten. Nov 19, 2009
* Flow 1.2 by Wesley Luyten. Mar 10, 2010
* Flow 1.3 by Wesley Luyten.
* Flow 1.4 by Wesley Luyten.
* Flow 1.5 by Wesley Luyten. July 28, 2010

	-added support for OVA
	-styling of text is done with CSS from this version, several flashvars are deprecated
	-made several functions public so others plugins can hook in, example: scrollbar, search...
	-added focallength, reflection opacity and reflection ratio for more customization
	-added buffer icon to show when loading the media file

* Flow 2.0 by Wesley Luyten. June 08, 2011
* Flow 2.1 by Wesley Luyten. February 10, 2012
* Flow 2.2 by Wesley Luyten. October 18, 2012

	-make compatible with jw6
*
* Copyright (c) 2012 Wesley Luyten
**/

package com.wessite {

	import flash.display.*;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	import flash.net.*;	
	import flash.utils.*;
	import flash.text.*;
	
	import com.longtailvideo.jwplayer.events.*;
	import com.longtailvideo.jwplayer.model.*;
	import com.longtailvideo.jwplayer.parsers.*;
	import com.longtailvideo.jwplayer.player.*;
	import com.longtailvideo.jwplayer.plugins.*;
	import com.longtailvideo.jwplayer.view.components.*;
	import com.longtailvideo.jwplayer.view.interfaces.*;
	import com.longtailvideo.jwplayer.utils.*;
		
	import aze.motion.EazeTween;
	import aze.motion.easing.*;
	import net.hires.debug.Stats;
	
	import com.wessite.flow.*;

	
	public class Main extends Sprite implements IPlugin6 {


		[Embed(source="../../images/flow-dock.png")]
		private var FlowDockIcon:Class;

		[Embed(source='../../fonts/Arial Rounded Bold.ttf', fontName='Arial Rounded MT Bold', fontFamily='Arial Rounded MT Bold', fontWeight='normal', mimeType='application/x-font')]
		private static var EmbedArialRoundedMTBold:Class;
		Font.registerFont(EmbedArialRoundedMTBold);
		
		
		private var defaultConfig:Object = {
			size: 					150,
			backgroundcolor:		'000000',
			gradientcolor:			undefined,
			coverwidth: 			150,
			coverheight: 			'auto',
			covergap: 				40,
			coverangle: 			70,
			coverdepth: 			170,
			coveroffset: 			130,
			removeblackborder:		false,
			fixedsize:				false,
			focallength:			250,
			opacitydecrease: 		0.1,
			reflectionopacity: 		0.3,
			reflectionratio: 		155,
			reflectionoffset: 		0,
			showduration:			true,
			showtext: 				true,
			textstyle:				'div#flow_textfield{color:#f1f1f1; text-align:center; font-family:Arial Rounded MT Bold;} #flow_textfield h1{font-size:14px; font-weight:normal; line-height:21px;} #flow_textfield h2{font-size:11px; font-weight:normal;}',
			textoffset: 			75,
			tweentime: 				0.8,
			framerate: 				60,
			rotatedelay: 			0,
			dockicon:		 		true,
			onidle:					'show',
			onpaused:				'hide',
			onplaying:				'hide',
			oncompleted:			'show',
			file:					undefined,
			xposition: 				0,
			yposition: 				0
		};
		
		public var player:IPlayer;
		public var playlist:IPlaylist;
		private var config:PluginConfig;
		
		private var flow:Flow;
		private var masker:Sprite;
		private var datalist:Array;
		private var indexMap:Array;
		private var textField:TextField;
		private var rotateInterval:Timer;
		private var controlIcon:Bitmap;
		private var dockIcon:Bitmap;
		
		private var animating:Boolean = false;
		private var slideSize:Number;

		private var focusCallbacks:Array = [];
		private var clickCallbacks:Array = [];
		private var showCallbacks:Array = [];
		private var hideCallbacks:Array = [];
		
		
		public function Main() {
			//addChild(new Stats());
		}
		
		public function initPlugin(ply:IPlayer, cfg:PluginConfig):void {
			player = ply;
			playlist = player.playlist;
			
			config = cfg;
			for (var prp:String in defaultConfig) {
				if (config[prp] == undefined) config[prp] = defaultConfig[prp];
			}
			
			stage.frameRate = config.framerate;
			slideSize = config.size;
						
			if (config.backgroundcolor is String) {
				config.backgroundcolor = config.backgroundcolor.indexOf('0x') != -1 ? uint(config.backgroundcolor) : uint('0x' + config.backgroundcolor);
			}
			if (config.gradientcolor != undefined) {
				config.gradientcolor = config.gradientcolor.indexOf('0x') != -1 ? uint(config.gradientcolor) : uint('0x' + config.gradientcolor);
			}
			
			masker = new Sprite();
			masker.graphics.beginFill(0);
			masker.graphics.drawRect(0, 0, config.width, config.height);
			masker.graphics.endFill();
			this.parent.addChild(masker);
			this.mask = masker;

			if (config.dockicon == true && player.controls.dock) {
				dockIcon = new FlowDockIcon();
				player.controls.dock.addButton(dockIcon, 'Show Playlist', showOnDockButtonClick);
			}

			player.addEventListener(PlaylistEvent.JWPLAYER_PLAYLIST_LOADED, playlistHandler);
			player.addEventListener(PlaylistEvent.JWPLAYER_PLAYLIST_ITEM, itemHandler);
			player.addEventListener(PlayerStateEvent.JWPLAYER_PLAYER_STATE, stateHandler);
			player.addEventListener(MediaEvent.JWPLAYER_MEDIA_COMPLETE, completeHandler)
			player.addEventListener(ViewEvent.JWPLAYER_VIEW_STOP, stopHandler);

			this.parent.addEventListener(MouseEvent.ROLL_OVER, MouseWheel.capture);
			this.parent.addEventListener(MouseEvent.ROLL_OUT, MouseWheel.release);
			stage.addEventListener(MouseEvent.MOUSE_WHEEL, scrollOnMousewheel);
			
			setupJSListeners();
		}
		
		private function scrollOnMousewheel(e:MouseEvent):void {
			e.stopPropagation();
			
			var delta:Number = Math.ceil(Math.abs(e.delta) / 120);
			if (delta > 0) {
				var sign:Number = Math.abs(e.delta) / e.delta;
				if (sign > 0) var func:Function = left;
				else if (sign < 0) func = right;
				if (func is Function) {
					for (var i:int=0; i<delta; i++) func();
				}
			}
		}
		
		private function toggleOnControlbarButtonClick(e:Event=null):void {
			// Update to support OVA
			if (!playlist.currentItem['ova.hidden']) {
				if (visible) hide();
				else show();
			}
		}
		
		private function showOnDockButtonClick(e:Event=null):void {
			// Update to support OVA
			if (!playlist.currentItem['ova.hidden']) {
				player.pause();
				show();
			}
		}
		
		public function set size(value:Number):void {
			config.size = value;
			player.redraw();
		}
		
		public function get size():Number {
			return config.size;
		}
		
		//public for other plugins to make use of
		public function hide():void {
			if (animating || visible == false) return;
			animating = true;
			
			if (controlIcon) controlIcon.alpha = 0.5;
			
			if (isPositioned()) {
				new EazeTween(this).to(0.4, { size:0 }).easing(Cubic.easeOut).onComplete(hideComplete);
			} else {
				if (config.showtext == true) {
					new EazeTween(textField).to(0.7, { alpha:0 });
				}
				flow.hide(hideBack);
			}
			
			for (var i:int=0; i<hideCallbacks.length; i++) {
				if (hideCallbacks[i] is String && ExternalInterface.available) {
					ExternalInterface.call(hideCallbacks[i] as String);
				} else if (hideCallbacks[i] is Function) {
					hideCallbacks[i]();
				}
			}
		}
		
		private function hideBack():void {
			new EazeTween(this).to(0.7, { alpha:0 }).onComplete(hideComplete);
		}
		
		private function hideComplete():void {
			visible = false;
			stage.frameRate = 30; // if the plugin is hidden save some CPU
			animating = false;
		}
		
		//public for other plugins to make use of
		public function show():void {
			if (animating || visible == true) return;
			animating = true;
			
			visible = true;
			stage.frameRate = config.framerate;
			if (controlIcon) controlIcon.alpha = 1;
			
			if (isPositioned()) {
				size = 1;
				new EazeTween(this).to(0.4, { size:slideSize }).easing(Cubic.easeOut).onComplete(showComplete);
			} else {
				new EazeTween(this).to(0.7, { alpha:1 }).onComplete(showFlow);
			}
			
			for (var i:int=0; i<showCallbacks.length; i++) {
				if (showCallbacks[i] is String && ExternalInterface.available) {
					ExternalInterface.call(showCallbacks[i] as String);
				} else if (showCallbacks[i] is Function) {
					showCallbacks[i]();
				}
			}
		}
		
		private function showFlow():void {
			if (config.showtext == true) {
				new EazeTween(textField).to(0.7, { alpha:1 });
			}
			flow.show(showComplete);
		}
		
		private function showComplete():void {
			animating = false;
		}
		
		private function isPositioned():Boolean {
			return config.position == 'left' || config.position == 'right'
				|| config.position == 'top' || config.position == 'bottom';
		}
		
		private function coverFocus(index:int):void {
			if (config.showtext == true) {
				var d:Object = datalist[index];
				textField.htmlText = "<div><h1>" + (d.title == undefined ? "" : d.title) + "</h1><h2>" + (d.description == undefined ? "" : d.description) + "</h2></div>";
			}
			
			for (var i:int=0; i<focusCallbacks.length; i++) {
				if (focusCallbacks[i] is String && ExternalInterface.available) {
					ExternalInterface.call(focusCallbacks[i] as String, index);
				} else if (focusCallbacks[i] is Function) {
					focusCallbacks[i](index);
				}
			}
		}
	
		private function coverClick(index:int):void {
			if (config.rotatedelay > 0 && rotateInterval) { rotateInterval.stop(); }

			if (config.file == undefined) {
				if (indexMap[index] != playlist.currentIndex) player.playlistItem(indexMap[index]);
				else if (player.state == PlayerState.PLAYING) player.pause();
				else player.play();
			} else {
				if (datalist[index].link) navigateToURL(new URLRequest(datalist[index].link), player.config.linktarget);
				if (datalist[index].file) {
					player.load({file: datalist[index].file, image: datalist[index].image});
					player.play();
				}
			}
			
			for (var i:int=0; i<clickCallbacks.length; i++) {
				if (clickCallbacks[i] is String && ExternalInterface.available) {
					ExternalInterface.call(clickCallbacks[i] as String, index);
				} else if (clickCallbacks[i] is Function) {
					clickCallbacks[i](index);
				}
			}
		}
		
		private function playlistHandler(e:PlaylistEvent=null):void {
			
			config.coverheight = config.coverheight == "auto" ? config.height : config.coverheight;
			
			if (config.file == undefined) {
				
				datalist = [];
				indexMap = [];
				
				var count:int = 0;
				for (var i:int = 0; i < playlist.length; i++) {
					// Update to support OVA
					var itm:PlaylistItem = playlist.getItemAt(i);
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
				flow = new Flow(datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
								config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
								config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
				addChild(flow);
				afterFlow();
			} else {
				var ldr:URLLoader = new URLLoader();
				ldr.addEventListener(Event.COMPLETE, relatedComplete);
				ldr.load(new URLRequest(config.file));
			}
		}
		
		private function relatedComplete(e:Event):void {
		
			var loadedXML:XML = XML(e.target.data);
			var parser:IPlaylistParser = ParserFactory.getParser(loadedXML);
			if (parser) {
				var playlistItems:Array = parser.parse(loadedXML);
				if (playlistItems.length > 0) {
					relatedHandler(playlistItems);
				} else {
					playlistError("XML could not be parsed or playlist was empty");
				}
			} else {
				playlistError("Playlist file did not contain a valid playlist");
			}
		}
		
		protected function playlistError(message:String):void {
			if (message.indexOf("Error #2048") >= 0) {
				dispatchEvent(new PlayerEvent(PlayerEvent.JWPLAYER_ERROR, "Playlist could not be loaded due to crossdomain policy restrictions."));
			} else {
				dispatchEvent(new PlayerEvent(PlayerEvent.JWPLAYER_ERROR, "Playlist could not be loaded: " + message));
			}
		}
		
		private function relatedHandler(itemList:Array):void {
			
			datalist = [];
	
			for(var i:int=0; i<itemList.length; i++) {
				var itm:* = itemList[i];
				datalist[i] = {title: itm.title, description: itm.description, link: itm.link, file: itm.file};
				datalist[i].image = itm.image;
				if (config.showduration) {
					datalist[i].duration = itm.duration;
				}
			}
			
			if (flow) flow.destroy();
			flow = new Flow(datalist, config.coverwidth, config.coverheight, config.covergap, config.coverangle, config.coverdepth, config.coveroffset,
							config.opacitydecrease, config.backgroundcolor, config.reflectionopacity, config.reflectionratio, config.reflectionoffset,
							config.removeblackborder, config.fixedsize, config.tweentime, config.focallength);
			addChild(flow);
			afterFlow();
			flow.to(0);
		}
		
		private function afterFlow():void {
		
			flow.onFocus(coverFocus);
			flow.onClick(coverClick);
			
			if (textField && contains(textField)) removeChild(textField);
			if (config.showtext == true) {
				var style:StyleSheet = new StyleSheet();
				config.textstyle = config.textstyle.replace(/#flow_textfield/g, '');
				config.textstyle = config.textstyle.replace(/font-size:\s*?(\d+?)[a-z]*?;(.*?)line-height:\s*?(\d+?)[a-z]*?[;}]/g, function():String {
    				return 'font-size:' + arguments[1] + ';' + arguments[2] + 'leading:' + ((arguments[3] - arguments[1]) / 2) + ';';
				});
				style.parseCSS(config.textstyle);
				textField = new TextField();
				// if fontFamily is Arial Rounded MT Bold we can use the embedded font
				if (style.getStyle('div').fontFamily == "Arial Rounded MT Bold") {
					textField.embedFonts = true;
					textField.antiAliasType = AntiAliasType.ADVANCED;
				}
				textField.styleSheet = style;
				textField.selectable = false;
				textField.wordWrap = true;
				textField.multiline = true;
				addChild(textField);
				textField.addEventListener(MouseEvent.MOUSE_UP, disableFocus);
			}
			
			resize(config.width, config.height);
			itemHandler();
			
			if (config.onidle == 'hide') {
				this.visible = false;
				this.alpha = 0;
				flow.hide(null);
				textField.alpha = 0;
				stage.frameRate = 30; // if the plugin is hidden save some CPU

				if (controlIcon) controlIcon.alpha = 0.5;
			}
			
			if (config.rotatedelay > 0) {
				rotateInterval = new Timer(config.rotatedelay);
				rotateInterval.start();
				rotateInterval.addEventListener(TimerEvent.TIMER, rotateHandler);
				addEventListener(MouseEvent.CLICK, stopRotation, false, 0, true);
			}
			
			animating = false;
			if (config.file != undefined) {
				if (player.state == PlayerState.PLAYING || player.state == PlayerState.BUFFERING) {
					if (config.onplaying == 'show') show();
					else if (config.onplaying == 'hide') hide();
				}
			}
		}
		
		private function itemHandler(e:PlaylistEvent=null):void {
			// Update to support OVA
			if (playlist.currentItem['ova.hidden']) {
				// hide plugin when an ad is shown
				hide();
			} else if (config.file == undefined) {
				// use indexMap to resolve the correct cover index
				flow.to(indexMap.indexOf(playlist.currentIndex));
			}
		}
		
		private function disableFocus(e:MouseEvent=null):void {
			stage.focus = null;
		}
		
		private function stopRotation(e:MouseEvent=null):void {
			rotateInterval.stop();
		}
		
		private function rotateHandler(e:TimerEvent=null):void {
			flow.next();
		}
		
		private function stopHandler(e:ViewEvent=null):void {
			if (config.onidle == 'show') show();
			else if (config.onidle == 'hide') hide();
		}
		
		private function completeHandler(e:MediaEvent):void {
			if (config.oncompleted == 'show') show();
			else if (config.oncompleted == 'hide') hide();
		}
	
		private function stateHandler(e:PlayerStateEvent):void {
			switch (e.newstate) {
				case PlayerState.PAUSED:
					if (config.onpaused == 'show') show();
					else if (config.onpaused == 'hide') hide();
					break;
				case PlayerState.BUFFERING:
				case PlayerState.PLAYING:
					if (config.onplaying == 'show') show();
					else if (config.onplaying == 'hide') hide();
					break;
			}
		}
		
		public function get id():String {
		   return "flow";
		}

		public function get target():String {
        	return "6.0";
    	}
		
		public function resize(wid:Number, hei:Number):void {
			
			if (flow && flow.visible == false) {
				visible = false;
			}
			
			if (config.size == 0 && isPositioned()) {
				visible = false;
			}
						
			this.x = config.x;
			this.y = config.y;
			
			this.graphics.clear();
			this.graphics.beginFill(config.backgroundcolor);
			if (config.gradientcolor != undefined) {
				var m:Matrix = new Matrix();
				m.createGradientBox(wid, hei, Math.PI / 2);
				this.graphics.beginGradientFill(GradientType.LINEAR, [config.gradientcolor, config.backgroundcolor], [1, 1], [0, 255], m);
			}
			this.graphics.drawRect(0, 0, wid, hei);
			this.graphics.endFill();
			
			if (mask) {
				mask.width = wid;
				mask.height = hei;
				mask.x = x;
				mask.y = y;
			}
		
			if (flow) {
				flow.x = wid * 0.5 + config.xposition;
				flow.y = hei * 0.5 + config.yposition;
			}
		
			if (textField) {
				textField.width = wid;
				textField.y = hei - config.textoffset;
			}
		}
		
		//public for other plugins to make use of
		public function left():void { flow.left(); }
		public function right():void { flow.right(); }
		public function prev():void { flow.prev(); }
		public function next():void { flow.next(); }
		public function to(index:int):void { flow.to(index); }
		
		public function onFocus(c:*):void {
			focusCallbacks.push(c);
		}
		
		public function onClick(c:*):void {
			clickCallbacks.push(c);
		}
		
		public function onShow(c:*):void {
			showCallbacks.push(c);
		}
		
		public function onHide(c:*):void {
			hideCallbacks.push(c);
		}
		
		private function setupJSListeners():void {
			try {
				// Player API Calls
				ExternalInterface.addCallback("flowLeft", left);
				ExternalInterface.addCallback("flowRight", right);
				ExternalInterface.addCallback("flowPrev", prev);
				ExternalInterface.addCallback("flowNext", next);
				ExternalInterface.addCallback("flowTo", to);				
				ExternalInterface.addCallback("flowOnFocus", onFocus);
				ExternalInterface.addCallback("flowOnClick", onClick);
				
				ExternalInterface.addCallback("flowShow", show);
				ExternalInterface.addCallback("flowHide", hide);
				ExternalInterface.addCallback("flowOnShow", onShow);
				ExternalInterface.addCallback("flowOnHide", onHide);
				
			} catch(e:Error) {
				Logger.log("Could not initialize JavaScript API: "  + e.message);
			}
		}
	}
}
