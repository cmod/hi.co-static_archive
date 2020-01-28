/*!
 * Infinite Ajax Scroll, a jQuery plugin
 * Version 1.0.2
 * https://github.com/webcreate/infinite-ajax-scroll
 *
 * Copyright (c) 2011-2013 Jeroen Fiege
 * Licensed under MIT:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(a){Date.now=Date.now||function(){return +(new Date)},a.ias=function(A){function x(){var b;return J.onChangePage(function(f,c,d){B&&B.setPage(f,d),G.onPageChange.call(this,f,d,c)}),Q(),B&&B.havePage()&&(I(),b=B.getPage(),C.forceScrollTop(function(){var c;b>1?(q(b),c=K(!0),a("html, body").scrollTop(c)):Q()})),F}function Q(){O(),G.scrollContainer.scroll(M)}function M(){var c,b;c=C.getCurrentScrollOffset(G.scrollContainer),b=K(),c>=b&&(H()>=G.triggerPageThreshold?(I(),z(function(){D(c)})):D(c))}function I(){G.scrollContainer.unbind("scroll",M)}function O(){a(G.pagination).hide()}function K(c){var d,b;return d=a(G.container).find(G.item).last(),d.size()===0?0:(b=d.offset().top+d.height(),c||(b+=G.thresholdMargin),b)}function D(b,d){var c;c=a(G.next).attr("href");if(!c){return G.noneleft&&a(G.container).find(G.item).last().after(G.noneleft),I()}if(G.beforePageChange&&a.isFunction(G.beforePageChange)&&G.beforePageChange(b,c)===!1){return}J.pushPages(b,c),I(),j(),N(c,function(h,g){var l=G.onLoadItems.call(this,g),f;l!==!1&&(a(g).hide(),f=a(G.container).find(G.item).last(),f.after(g),a(g).fadeIn()),c=a(G.next,h).attr("href"),a(G.pagination).replaceWith(a(G.pagination,h)),P(),O(),c?Q():I(),G.onRenderComplete.call(this,g),d&&d.call(this)})}function N(g,l,d){var h=[],n,c=Date.now(),b,m;d=d||G.loaderDelay,a.get(g,null,function(f){n=a(G.container,f).eq(0),0===n.length&&(n=a(f).filter(G.container).eq(0)),n&&n.find(G.item).each(function(){h.push(this)}),l&&(m=this,b=Date.now()-c,b<d?setTimeout(function(){l.call(m,f,h)},d-b):l.call(m,f,h))},"html")}function q(b){var c=K(!0);c>0&&D(c,function(){I(),J.getCurPageNum(c)+1<b?(q(b),a("html,body").animate({scrollTop:c},400,"swing")):(a("html,body").animate({scrollTop:c},1000,"swing"),Q())})}function H(){var b=C.getCurrentScrollOffset(G.scrollContainer);return J.getCurPageNum(b)}function L(){var b=a(".ias_loader");return b.size()===0&&(b=a('<div class="ias_loader">'+G.loader+"</div>"),b.hide()),b}function j(){var b=L(),c;G.customLoaderProc!==!1?G.customLoaderProc(b):(c=a(G.container).find(G.item).last(),c.after(b),b.fadeIn())}function P(){var b=L();b.remove()}function k(b){var c=a(".ias_trigger");return c.size()===0&&(c=a('<div class="ias_trigger"><a href="#">'+G.trigger+"</a></div>"),c.hide()),a("a",c).off("click").on("click",function(){return e(),b.call(),!1}),c}function z(c){var d=k(c),b;b=a(G.container).find(G.item).last(),b.after(d),d.fadeIn()}function e(){var b=k();b.remove()}var G=a.extend({},a.ias.defaults,A),C=new a.ias.util,J=new a.ias.paging(G.scrollContainer),B=G.history?new a.ias.history:!1,F=this;x()},a.ias.defaults={container:"#container",scrollContainer:a(window),item:".item",pagination:"#pagination",next:".next",noneleft:!1,loader:'<img src="images/loader.gif"/>',loaderDelay:600,triggerPageThreshold:3,trigger:"Load more items",thresholdMargin:0,history:!0,onPageChange:function(){},beforePageChange:function(){},onLoadItems:function(){},onRenderComplete:function(){},customLoaderProc:!1},a.ias.util=function(){function c(){a(window).load(function(){b=!0})}var b=!1,e=!1,d=this;c(),this.forceScrollTop=function(f){a("html,body").scrollTop(0),e||(b?(f.call(),e=!0):setTimeout(function(){d.forceScrollTop(f)},1))},this.getCurrentScrollOffset=function(g){var f,h;return g.get(0)===window?f=g.scrollTop():f=g.offset().top,h=g.height(),f+h}},a.ias.paging=function(){function f(){a(window).scroll(h)}function h(){var k,m,p,n,i;k=d.getCurrentScrollOffset(a(window)),m=c(k),p=b(k),g!==m&&(n=p[0],i=p[1],j.call({},m,n,i)),g=m}function c(i){for(var k=e.length-1;k>0;k--){if(i>e[k][0]){return k+1}}return 1}function b(i){for(var k=e.length-1;k>=0;k--){if(i>e[k][0]){return e[k]}}return null}var e=[[0,document.location.toString()]],j=function(){},g=1,d=new a.ias.util;f(),this.getCurPageNum=function(i){return i=i||d.getCurrentScrollOffset(a(window)),c(i)},this.onChangePage=function(i){j=i},this.pushPages=function(i,k){e.push([i,k])}},a.ias.history=function(){function d(){b=!!(window.history&&history.pushState&&history.replaceState),b=!1}var c=!1,b=!1;d(),this.setPage=function(g,f){this.updateState({page:g},"",f)},this.havePage=function(){return this.getState()!==!1},this.getPage=function(){var f;return this.havePage()?(f=this.getState(),f.page):1},this.getState=function(){var g,h,f;if(b){h=history.state;if(h&&h.ias){return h.ias}}else{g=window.location.hash.substring(0,7)==="#/page/";if(g){return f=parseInt(window.location.hash.replace("#/page/",""),10),{page:f}}}return !1},this.updateState=function(e,g,f){c?this.replaceState(e,g,f):this.pushState(e,g,f)},this.pushState=function(h,g,e){var f;b?history.pushState({ias:h},g,e):(f=h.page>0?"#/page/"+h.page:"",window.location.hash=f),c=!0},this.replaceState=function(g,h,f){b?history.replaceState({ias:g},h,f):this.pushState(g,h,f)}}})(jQuery);