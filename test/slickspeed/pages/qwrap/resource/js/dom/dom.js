(function(){
var els=document.getElementsByTagName('script'), srcPath = '';
for (var i = 0; i < els.length; i++) {
	var src = els[i].src.split(/dom[\\\/]/g);
	if (src[1]) {
		srcPath = src[0];
		break;
	}
}

document.write('<script type="text/javascript" src="'+srcPath+'dom/selector.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/event.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/event.w.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/dom.u.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/node.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/eventtarget.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/node.w.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'dom/node.c.js"><\/script>');

})();
