var TWEEN=TWEEN||function(){var e,t,i,o,n=60,r=false,l=[],s;return{setFPS:function(e){n=e||60},start:function(e){if(arguments.length!==0){this.setFPS(e)}i=setInterval(this.update,1e3/n)},stop:function(){clearInterval(i)},setAutostart:function(e){r=e;if(r&&!i){this.start()}},add:function(e){l.push(e);if(r&&!i){this.start()}},getAll:function(){return l},removeAll:function(){l=[]},remove:function(t){e=l.indexOf(t);if(e!==-1){l.splice(e,1)}},update:function(t){e=0;s=l.length;var i=t||(new Date).getTime();while(e<s){if(l[e].update(i)){e++}else{l.splice(e,1);s--}}if(s===0&&r===true){this.stop()}}}}();TWEEN.Tween=function(e){var t=e,i={},o={},n={},r=1e3,l=0,s=null,a=TWEEN.Easing.Linear.EaseNone,f=null,h=null,d=null;this.to=function(e,i){if(i!==null){r=i}for(var o in e){if(t[o]===null){continue}n[o]=e[o]}return this};this.start=function(e){TWEEN.add(this);s=e?e+l:(new Date).getTime()+l;for(var r in n){if(t[r]===null){continue}i[r]=t[r];o[r]=n[r]-t[r]}return this};this.stop=function(){TWEEN.remove(this);return this};this.delay=function(e){l=e;return this};this.easing=function(e){a=e;return this};this.chain=function(e){f=e;return this};this.onUpdate=function(e){h=e;return this};this.onComplete=function(e){d=e;return this};this.update=function(e){var n,l,c;if(e<s){return true}l=(e-s)/r;l=l>1?1:l;c=a(l);for(n in o){t[n]=i[n]+o[n]*c}if(h!==null){h.call(t,c)}if(l==1){if(d!==null){d.call(t)}if(f!==null){f.start()}return false}return true}};TWEEN.Easing={Linear:{},Quadratic:{},Cubic:{},Quartic:{},Quintic:{},Sinusoidal:{},Exponential:{},Circular:{},Elastic:{},Back:{},Bounce:{}};TWEEN.Easing.Linear.EaseNone=function(e){return e};TWEEN.Easing.Cubic.EaseOut=function(e){return--e*e*e+1};if(!window.requestAnimationFrame){window.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e,t){window.setTimeout(e,1e3/60)}}()}var main=function(e,t,i){var o=this;var n;var r,l;var s,a;var f=false;var h;this.width=0;this.height=0;var d=0;var c=true;var u=false;var p=[];var g=[];var m=[];var w=[];var v={size:150,backgroundcolor:"000000",gradientcolor:undefined,coverwidth:150,coverheight:"auto",covergap:40,coverangle:70,coverdepth:170,coveroffset:130,removeblackborder:false,fixedsize:false,focallength:250,opacitydecrease:.1,reflectionopacity:.3,reflectionratio:155,reflectionoffset:0,showduration:true,showtext:true,textstyle:"div#flow_textfield{color:#f1f1f1; text-align:center; font-family:Arial Rounded MT Bold;} #flow_textfield h1{font-size:14px; font-weight:normal; line-height:21px;} #flow_textfield h2{font-size:11px; font-weight:normal;}",textoffset:75,tweentime:.8,rotatedelay:0,dockicon:true,onidle:"show",onpaused:"hide",onplaying:"hide",oncompleted:"show",file:undefined,xposition:0,yposition:0};function y(o){if(e.getRenderingMode()!="html5")return;for(var n in v){if(t[n]===undefined)t[n]=v[n]}var r=".jwplayer_flow {overflow:hidden;-webkit-touch-callout:none;-webkit-text-size-adjust:none;-webkit-tap-highlight-color:rgba(0,0,0,0);opacity:1;-webkit-transition:opacity .7s;}"+".jwplayer_flow div.flow_wrap {position:absolute;left:50%;top:50%;-webkit-perspective:250;-webkit-transform-style:preserve-3d;}"+".jwplayer_flow div.flow_tray {-webkit-transform-style:preserve-3d;}"+".jwplayer_flow div.flow_tray,.jwplayer_flow div.flow_cell {position:absolute;-webkit-transform:translate3d(0,0,0);-webkit-backface-visibility:hidden;-webkit-transition:-webkit-transform .8s cubic-bezier(0.190,1.000,0.220,1.000);}"+".jwplayer_flow div.flow_cell canvas {position:absolute;opacity:1;-webkit-transition:opacity .7s;}"+"#flow_textfield {position:absolute;width:100%;opacity:1;-webkit-transition:opacity .7s;}"+"#flow_textfield h1,#flow_textfield h2{margin:0;}";var l=document.getElementsByTagName("head")[0];var s=document.createElement("style");var a=t.textstyle;s.setAttribute("type","text/css");s.appendChild(document.createTextNode(r));s.appendChild(document.createTextNode(a));l.appendChild(s);i.className+="jwplayer_flow";i.addEventListener("webkitTransitionEnd",R);d=t.size;t.backgroundcolor=t.backgroundcolor.indexOf("#")==-1?"#"+t.backgroundcolor:t.backgroundcolor;i.style.backgroundColor=t.backgroundcolor;if(t.gradientcolor!==undefined){t.gradientcolor=t.gradientcolor.indexOf("#")==-1?"#"+t.gradientcolor:t.gradientcolor;i.style.background="-webkit-gradient(linear, left top, left bottom, from("+t.gradientcolor+"), to("+t.backgroundcolor+"))"}if(t.dockicon===true&&typeof e.addButton==="function"){var f="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAPCAYAAADgbT9oAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0Q3JlYXRpb24gVGltZQA2LzE4LzEx7HcX+AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAABCSURBVDiN7ZMxDgAgCAMP4/+/XAcjIQ4OBDduYeq1CyZJgFGLRrHQmbGFvVxJ18kawLfFLW5xix/El7brZvDst8ULHQsIIS+DTYcAAAAASUVORK5CYII=";e.addButton(f,"Show Playlist",b,"flow")}e.onPlaylist(_);e.onPlaylistItem(O);e.onPlay(Y);e.onBuffer(Y);e.onPause(Y);e.onComplete(B);i.addEventListener("mousewheel",E)}function E(e){e.preventDefault();var t=Math.ceil(Math.abs(e.wheelDelta)/120);if(t>0){var i=Math.abs(e.wheelDelta)/e.wheelDelta;var n=null;if(i>0)n=o.left;else if(i<0)n=o.right;if(typeof n==="function"){for(var r=0;r<t;r++)n()}}}function b(){if(!n[e.getCurrentItem()]["ova.hidden"]){e.pause(true);o.show()}}function C(){return e.getContainer().getElementsByTagName("video")[0]}function A(){if(C()){var e=C().style.webkitTransform;if(e){C().style.webkitTransform=e.replace(/translate\(.+?\)/,"translate(-"+o.width+"px,-"+o.height+"px)")}else{C().style.webkitTransform="translate(-"+o.width+"px,-"+o.height+"px)"}}}function x(){if(C()){var e=C().style.webkitTransform;C().style.webkitTransform=e.replace(/translate\(.+?\)/,"translate(0px,0px)")}}function k(){return t.position=="left"||t.position=="right"||t.position=="top"||t.position=="bottom"}function T(e){if(t.showtext===true){var i=s[e];if(i){l.innerHTML="<h1>"+(i.title===undefined?"":i.title)+"</h1><h2>"+(i.description===undefined?"":i.description)+"</h2>"}}for(var o=0;o<p.length;o++){p[o](e)}}function F(i){if(t.rotatedelay>0&&h){o.stopRotation()}if(t.file===undefined){if(a[i]!=e.getCurrentItem())e.playlistItem(a[i]);else if(e.getState()=="PLAYING")e.pause(true);else e.play(true)}else{if(s[i].link)window.open(s[i].link,e.config.linktarget);if(s[i].file){e.load({file:s[i].file,image:s[i].image});e.play()}}for(var n=0;n<g.length;n++){g[n](i)}}function R(e){if(e.target==i){if(parseInt(i.style.opacity,10)===0){L()}else{P()}}}function M(){u=false;o.resize()}function N(){if(f||U()===false)return;f=true;if(k()){new TWEEN.Tween(t).to({size:0},400).easing(TWEEN.Easing.Cubic.EaseOut).onUpdate(M).onComplete(L).start()}else{setTimeout(function(){if(t.showtext===true){l.style.opacity=0}r.hide(I)},100);x()}for(var e=0;e<w.length;e++){w[e]()}}function I(){i.style.opacity=0}function L(){H(false);f=false}function D(){if(f||U()===true)return;f=true;H(true);if(k()){t.size=1;M();new TWEEN.Tween(t).to({size:d},400).easing(TWEEN.Easing.Cubic.EaseOut).onUpdate(M).onComplete(S).start()}else{setTimeout(function(){i.style.opacity=1},100)}for(var e=0;e<m.length;e++){m[e]()}}function P(){if(t.showtext===true){l.style.opacity=1}r.show(S)}function S(){f=false;if(!k()){A()}}function _(o){n=o.playlist;t.coverheight=t.coverheight=="auto"?e.config.height:t.coverheight;if(t.file===undefined){s=[];a=[];var l=0;for(var f=0;f<n.length;f++){var h=n[f];if(!h["ova.hidden"]&&h.image){s[l]={title:h.title,description:h.description};s[l].image=h.image;if(t.showduration){s[l].duration=h.duration}a[l]=f;l++}}if(r)r.destroy();r=new Flow(i,s,t.coverwidth,t.coverheight,t.covergap,t.coverangle,t.coverdepth,t.coveroffset,t.opacitydecrease,t.backgroundcolor,t.reflectionopacity,t.reflectionratio,t.reflectionoffset,t.removeblackborder,t.fixedsize,t.tweentime,t.focallength);i.appendChild(r.domElement);X()}else{jwplayer.utils.ajax(t.file,z)}}function z(e){try{var t=jwplayer.utils.parsers.rssparser.parse(e.responseXML.firstChild);if(t.length>0){G(t)}}catch(i){}}function G(e){s=[];for(var o=0;o<e.length;o++){var n=e[o];s[o]={title:n.title,description:n.description,link:n.link,file:n.file};s[o].image=n.image;if(t.showduration){s[o].duration=n.duration}}if(r)r.destroy();r=new Flow(i,s,t.coverwidth,t.coverheight,t.covergap,t.coverangle,t.coverdepth,t.coveroffset,t.opacitydecrease,t.backgroundcolor,t.reflectionopacity,t.reflectionratio,t.reflectionoffset,t.removeblackborder,t.fixedsize,t.tweentime,t.focallength);i.appendChild(r.domElement);X();r.to(0)}function X(){r.onFocus(T);r.onClick(F);if(l)i.removeChild(l);if(t.showtext===true){l=document.createElement("div");l.setAttribute("id","flow_textfield");i.appendChild(l)}o.resize();O();i.style.display="block";if(t.onidle=="hide"){i.style.display="none";H(false);i.style.opacity=0;r.hide(null);l.style.opacity=0}if(t.rotatedelay>0){if(h)o.stopRotation();h=setInterval(W,t.rotatedelay);i.addEventListener("touchstart",o.stopRotation,false);i.addEventListener("mousedown",o.stopRotation,false)}f=false;if(t.file!==undefined){if(e.getState()=="PLAYING"||e.getState()=="BUFFERING"){if(t.onplaying=="show")o.show();else if(t.onplaying=="hide")o.hide()}}}function O(i){if(n[e.getCurrentItem()]["ova.hidden"]){o.hide()}else if(t.file===undefined){r.to(a.indexOf(e.getCurrentItem()))}}function B(e){if(t.oncompleted=="show")o.show();else if(t.oncompleted=="hide")o.hide()}function Y(i){switch(e.getState()){case"PAUSED":if(t.onpaused=="show")o.show();else if(t.onpaused=="hide")o.hide();break;case"BUFFERING":case"PLAYING":if(t.onplaying=="show")o.show();else if(t.onplaying=="hide")o.hide();break}}function U(){return i.style.display!="none"}function H(e){if(e){i.style.display="block"}else{i.style.display="none"}}e.onReady(y);this.stopRotation=function(){i.removeEventListener("touchstart",o.stopRotation,false);i.removeEventListener("mousedown",o.stopRotation,false);clearInterval(h)};function W(){r.next()}this.left=function(){if(e.getRenderingMode()=="html5"){r.left()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowLeft()}};this.right=function(){if(e.getRenderingMode()=="html5"){r.right()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowRight()}};this.prev=function(){if(e.getRenderingMode()=="html5"){r.prev()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowPrev()}};this.next=function(){if(e.getRenderingMode()=="html5"){r.next()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowNext()}};this.to=function(t){if(e.getRenderingMode()=="html5"){r.to(t)}else if(e.getRenderingMode()=="flash"){e.getContainer().flowTo(t)}};this.onFocus=function(t){if(e.getRenderingMode()=="html5"){p.push(t)}else if(e.getRenderingMode()=="flash"){e.getContainer().flowOnFocus(t.toString())}};this.onClick=function(t){if(e.getRenderingMode()=="html5"){g.push(t)}else if(e.getRenderingMode()=="flash"){e.getContainer().flowOnClick(t.toString())}};this.hide=function(){if(e.getRenderingMode()=="html5"){N()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowHide()}};this.show=function(){if(e.getRenderingMode()=="html5"){D()}else if(e.getRenderingMode()=="flash"){e.getContainer().flowShow()}};this.onHide=function(t){if(e.getRenderingMode()=="html5"){w.push(t)}else if(e.getRenderingMode()=="flash"){e.getContainer().flowOnHide(t.toString())}};this.onShow=function(t){if(e.getRenderingMode()=="html5"){m.push(t)}else if(e.getRenderingMode()=="flash"){e.getContainer().flowOnShow(t.toString())}};this.getDisplayElement=function(){return i};function j(t,i){if(!u){u=true;if(c){c=false;setTimeout(function(){e.resize(t,i)},0)}else{e.resize(t,i)}}}this.resize=function(n,s){if(e.getRenderingMode()=="html5"){if(n)o.width=n;if(s)o.height=s;var a=o.width;var f=o.height;if(k()&&t.size>0){if(t.position=="left"||t.position=="right"){a=t.size;f=e.config.height;j(e.config.width-a,e.config.height);i.style[t.position]=-t.size+"px"}else if(t.position=="top"||t.position=="bottom"){a=e.config.width;f=t.size;j(e.config.width,e.config.height-f);if(t.position=="top"){i.style.top=-f+"px"}else if(t.position=="bottom"){i.style.top=e.config.height-f+"px"}}e.getContainer().style["margin"+Q(t.position)]=t.size+"px"}i.style.width=a+"px";i.style.height=f+"px";if(r){r.domElement.style.left=a*.5+t.xposition+"px";r.domElement.style.top=f*.5+t.yposition+"px"}if(l){l.style.top=f-t.textoffset+"px"}}else{if(i.parentNode){i.parentNode.removeChild(i)}}};function Q(e){return e.substr(0,1).toUpperCase()+e.substr(1)}function V(){window.requestAnimationFrame(V);TWEEN.update()}V()};Flow=function(e,t,i,o,n,r,l,s,a,f,h,d,c,u,p,g,m){var w=this;this.GAP=n;this.ANGLE=r;this.DEPTH=-l;this.OFFSET=s+n;this.T_NEG_ANGLE="rotateY("+-this.ANGLE+"deg)";this.T_ANGLE="rotateY("+this.ANGLE+"deg)";this.OPACITY=a;this.DURATION=g;this.hideComplete=null;this.showComplete=null;var v=[];var y=t.length;var E=0;var b=0;var C=0;var A=[];var x=[];this.domElement=document.createElement("div");this.domElement.setAttribute("id","flow_wrap");this.domElement.setAttribute("class","flow_wrap");var k=document.createElement("div");k.setAttribute("id","flow_tray");k.setAttribute("class","flow_tray");this.domElement.appendChild(k);this.domElement.style.webkitPerspective=m;var T=new FlowDelegate(this,k);var F=new TouchController(this,T,k);var R=null;for(var M=0;M<t.length;M++){R=new FlowItem(w,M,t[M].image,t[M].duration,i,o,h,d,c,f,u,p);T.cells.push(R);k.appendChild(R.domElement);R.domElement.onmousedown=I;R.domElement.style.webkitTransitionDuration=g+"s";v[M]=R}R.domElement.firstChild.addEventListener("webkitTransitionEnd",N,true);function N(e){e.stopPropagation();if(parseInt(R.domElement.firstChild.style.opacity,10)===0){w.domElement.style.opacity=0;if(typeof w.hideComplete=="function")w.hideComplete()}else if(parseInt(R.domElement.firstChild.style.opacity,10)===1){if(typeof w.showComplete=="function")w.showComplete()}}this.hide=function(e){w.hideComplete=e;for(var t=0;t<v.length;t++){v[t].domElement.firstChild.style.opacity=0}};this.show=function(e){w.showComplete=e;w.domElement.style.opacity=1;for(var t=0;t<v.length;t++){v[t].domElement.firstChild.style.opacity=1}};this.itemComplete=function(e){b=b<e?e:b;++E;if(E==y){w.to(0);for(var t=0;t<y;t++){v[t].setY(b)}}};this.left=function(){if(C>0)w.to(C-1)};this.right=function(){if(C<y-1)w.to(C+1)};this.prev=function(){if(C>0)w.to(C-1);else w.to(y-1)};this.next=function(){if(C<y-1)w.to(C+1);else w.to(0)};this.to=function(e){if(e>y-1)e=y-1;else if(e<0)e=0;C=e;F.to(e)};this.focused=function(e){for(var t=0;t<A.length;t++){A[t](e)}};this.clicked=function(e){for(var t=0;t<x.length;t++){x[t](e)}};this.onFocus=function(e){A.push(e)};this.onClick=function(e){x.push(e)};this.destroy=function(){e.removeChild(w.domElement);e.removeEventListener("touchstart",F,true);window.removeEventListener("keydown",L,false)};function I(e){var t=0,i=e.currentTarget;while(i=i.previousSibling)++t;var o=v[t];if(e.offsetY<o.halfHeight){e.preventDefault();if(o.index!=C)w.to(o.index);else w.clicked(o.index)}}e.addEventListener("touchstart",F,true);window.addEventListener("keydown",L,false);function L(e){switch(e.keyCode){case 37:w.left();break;case 39:w.right();break;case 38:w.to(0);break;case 40:w.to(y-1);break;case 32:w.clicked(C);break}}};FlowItem=function(e,t,i,o,n,r,l,s,a,f,h,d){var c=this;var u;var p;this.index=t;this.halfHeight=0;this.domElement=document.createElement("div");this.domElement.className="flow_cell";var g=this.domElement.style;g.backgroundColor=f;var m=document.createElement("canvas");c.domElement.appendChild(m);var w=document.createElement("img");w.addEventListener("load",v);w.src=i;function v(){var t=w.width;var i=w.height;var o=0;var f=0;var v=0;if(h){var y=document.createElement("canvas");y.width=t;y.height=i;var E=y.getContext("2d");E.drawImage(w,0,0);var b=E.getImageData(0,0,t,i).data;var C=0;var A=0;var x=0;for(var k=0;k<i;k++){C=0;for(A=0;A<t;A++){x=(k*t+A)*4;C+=b[x]<<16|b[x+1]<<8|b[x+2]}if(C/t<460551)o++;else break}for(k=i-1;k>=0;k--){C=0;for(A=0;A<t;A++){x=(k*t+A)*4;C+=b[x]<<16|b[x+1]<<8|b[x+2]}if(C/t<460551)f++;else break}i-=o+f}var T;if(d){u=Math.round(n);p=Math.round(r);if(u/t<p/i){T=p/i;v+=(t-u/T)*.5}else{T=u/t;o+=(i-p/T)*.5}}else{if(n>=r){u=Math.round(t/i*r);p=Math.round(r);T=r/i}else{u=Math.round(n);p=Math.round(i/t*n);T=n/t}}c.halfHeight=p;g.top=-(p*.5)+"px";g.left=-(u*.5)+"px";g.width=u+"px";g.height=p+"px";m.width=u;m.height=p*2;var F=m.getContext("2d");F.drawImage(w,v,o,t-2*v,i-2*o,0,0,u,p);if(l>0){g.height=p*2+"px";c.reflect(m,u,p,l,s,a)}e.itemComplete(p)}this.setY=function(e){var t=e*.5-(e-p);this.domElement.style.top=-t+"px"}};FlowItem.prototype.reflect=function(e,t,i,o,n,r){var l=e.getContext("2d");l.save();l.scale(1,-1);l.drawImage(e,0,-i*2-r);l.restore();l.globalCompositeOperation="destination-out";var s=l.createLinearGradient(0,0,0,i);s.addColorStop(n/255,"rgba(255, 255, 255, 1.0)");s.addColorStop(0,"rgba(255, 255, 255, "+(1-o)+")");l.translate(0,i+r);l.fillStyle=s;l.fillRect(0,0,t,i)};TouchController=function(e,t,i){this.flow=e;this.delegate=t;this.elem=i;this.currentX=0};TouchController.prototype.touchstart=function(e){e.stopImmediatePropagation();this.startX=e.touches[0].pageX-this.currentX;this.pageY=e.touches[0].pageY;this.touchMoved=false;window.addEventListener("touchmove",this,true);window.addEventListener("touchend",this,true);this.elem.style.webkitTransitionDuration="0s"};TouchController.prototype.touchmove=function(e){e.stopImmediatePropagation();this.touchMoved=true;this.lastX=this.currentX;this.lastMoveTime=(new Date).getTime();this.currentX=e.touches[0].pageX-this.startX;this.delegate.update(this.currentX)};TouchController.prototype.touchend=function(e){e.stopImmediatePropagation();window.removeEventListener("touchmove",this,true);window.removeEventListener("touchend",this,true);this.elem.style.webkitTransitionDuration=this.flow.DURATION+"s";if(this.touchMoved){var t=this.currentX-this.lastX;var i=(new Date).getTime()-this.lastMoveTime+1;this.currentX=this.currentX+t*50/i;this.delegate.updateTouchEnd(this)}else{this.delegate.click(e,this.pageY,this.currentX)}};TouchController.prototype.to=function(e){this.currentX=-e*this.delegate.flow.GAP;this.delegate.update(this.currentX)};TouchController.prototype.handleEvent=function(e){this[e.type](e);e.preventDefault()};FlowDelegate=function(e,t){this.flow=e;this.elem=t;this.cells=[];this.transforms=[];this.prevF=-1};FlowDelegate.prototype.updateTouchEnd=function(e){var t=this.getFocusedCell(e.currentX);e.currentX=-t*this.flow.GAP;this.update(e.currentX)};FlowDelegate.prototype.getFocusedCell=function(e){var t=-Math.round(e/this.flow.GAP);return Math.min(Math.max(t,0),this.cells.length-1)};FlowDelegate.prototype.getFocusedCellOne=function(e){var t=-Math.round(e/this.flow.GAP);return Math.min(Math.max(t,-1),this.cells.length)};FlowDelegate.prototype.click=function(e,t,i){var o=-Math.round(i/this.flow.GAP);var n=this.cells[o];if(n.domElement==e.target.parentNode){var r=this.findPos(n.domElement);var l=t-r.y;if(l<n.halfHeight){this.flow.clicked(n.index)}}};FlowDelegate.prototype.findPos=function(e){var t=0;var i=0;if(e.offsetParent){do{t+=e.offsetLeft;i+=e.offsetTop}while(e=e.offsetParent);return{x:t,y:i}}};FlowDelegate.prototype.setStyleForCell=function(e,t,i){if(this.transforms[t]!=i){e.domElement.style.webkitTransform=i;this.transforms[t]=i}};FlowDelegate.prototype.transformForCell=function(e,t,i){var o=t*this.flow.GAP;if(e==t){return"translate3d("+o+"px, 0, 0)"}else if(t>e){return"translate3d("+(o+this.flow.OFFSET)+"px, 0, "+this.flow.DEPTH+"px) "+this.flow.T_NEG_ANGLE}else{return"translate3d("+(o-this.flow.OFFSET)+"px, 0, "+this.flow.DEPTH+"px) "+this.flow.T_ANGLE}};FlowDelegate.prototype.update=function(e){this.elem.style.webkitTransform="translate3d("+e+"px, 0, 0)";var t=this.getFocusedCellOne(e);if(t!=this.prevF){this.flow.focused(t);for(var i=0;i<this.cells.length;i++){if(i<t){this.cells[i].domElement.style.zIndex=i}else{this.cells[i].domElement.style.zIndex=this.cells.length-i+t-1}}this.prevF=t}for(var o=0;o<this.cells.length;o++){this.setStyleForCell(this.cells[o],o,this.transformForCell(t,o,e))}};jwplayer().registerPlugin("flow","6.0",main,"./flow-2.swf")