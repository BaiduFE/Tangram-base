(function(){
var els=document.getElementsByTagName('script'), srcPath = '';
for (var i = 0; i < els.length; i++) {
	var src = els[i].src.split(/core[\\\/]/g);
	if (src[1]) {
		srcPath = src[0];
		break;
	}
}
document.write('<script type="text/javascript" src="'+srcPath+'core/core_base.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/browser.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/string.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/object.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/array.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/date.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/function.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/class.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/helper.h.js"><\/script>');
document.write('<script type="text/javascript" src="'+srcPath+'core/custevent.js"><\/script>');
})();