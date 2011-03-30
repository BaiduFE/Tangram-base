# get output.js by import.php
PORT=8000
LOG=yuiinfo
PROJ=Tangram-base
JAVAHOME=/home/work/soft/jdk1.6.0_06/bin/
rm core_release.js
rm all_release.js
wget -O core_release_src.js -d "http://localhost:$PORT/$PROJ/src/import.php?f=core&path=..%2Frelease%2F"
wget -O all_release_src.js -d "http://localhost:$PORT/$PROJ/src/import.php?f=all&path=..%2Frelease%2F"
#rm -rf $LOG
echo "====INFO from core.js====" > $LOG
$JAVAHOME/java -jar yuicompressor-2.4.2.jar -v -o core_release.js core_release_src.js 2>> $LOG
echo >>$LOG
echo >>$LOG
echo "====INFO from all.js====" >> $LOG
$JAVAHOME/java -jar yuicompressor-2.4.2.jar -v -o all_release.js all_release_src.js 2>> $LOG
cat $LOG | mail -s 'yui info from build.sh' yangbo@baidu.com 
#-c 'leizhixing@baidu.com,wangpengcheng@baidu.com' yangbo@baidu.com