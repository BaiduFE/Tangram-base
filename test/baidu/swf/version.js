module("baidu.swf.version");

var check=function(needVersion){
	var version=baidu.swf.version,vUnit1,vUnit2,i;
	var needVersion=needVersion;
	if (version) {
        version = version.split('.');
        needVersion = needVersion.split('.');
        for (i = 0; i < 3; i++) {
            vUnit1 = parseInt(version[i], 10);
            vUnit2 = parseInt(needVersion[i], 10);
            if (vUnit2 < vUnit1) {
                return "flash插件版本符合要求";
            } else if (vUnit2 > vUnit1) {
                return "flash插件版本太低"; // 需要更高的版本号
            }
        }
    } else {
        return '未安装flash 插件'; // 未安装flash插件
    }
	
}

test("test version", function() {
	stop();
	equal(check('6.0.0'),"flash插件版本符合要求","flash插件版本符合要求");
	equal(check('11.0.0'),"flash插件版本太低","flash插件版本太低");
	//equal(check('6.0.0'),"未安装flash 插件","未安装flash 插件");//only work when there is no flash player
	start();
});
