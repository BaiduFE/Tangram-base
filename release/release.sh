#!/bin/sh

if [ -e ./output ]; then
    rm -rf output
fi;
mkdir output

cp all.js all_src.js
cp core.js core_src.js

#拷贝src目录，删除svn目录
cp -ra ../src/baidu/ ./
cp -ra ../src/baidu.js ./
cd baidu/
for i in `find \. -type d -name .svn -print` ; do rm -rf $i; done;
cd ../

tc2  release.xml ./
rm -rf  ./baidu/
rm baidu.js
mv output/core.js ./core_release.js
mv output/all.js ./all_release.js
mv output/core_src.js ./core_src_release.js
mv output/all_src.js ./all_src_release.js
rm -rf output/
rm -f all_src.js
rm -f core_src.js

echo "release done!";
