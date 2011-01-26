# get output.js by import.php
PORT=8000
PROJ=Tangram-base
rm core_release.js
rm all_release.js
wget -O core_release_src.js -d "http://localhost:$PORT/$PROJ/src/import.php?f=core&path=..%2Frelease%2F"
wget -O all_release_src.js -d "http://localhost:$PORT/$PROJ/src/import.php?f=all&path=..%2Frelease%2F"
java -jar yuicompressor-2.4.2.jar -o core_release.js core_release_src.js
java -jar yuicompressor-2.4.2.jar -o all_release.js all_release_src.js
