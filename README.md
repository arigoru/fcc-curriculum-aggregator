# fcc-curriculum-aggregator
Small project that aggregates and presents content of freecodecamp.org curriculum on one page.

# tools note
To parse curriculum into json files:  
 - get "curriculum/challenges/_meta" and "curriculum/challenges/english" from main FCC repository
 - place **parseLesson.js** **parseMeta.sh** and **parseLessons.sh** in "challenges" folder or just same folder as **_meta** and **english**
 - run **parseMeta.sh** to create **meta.json**
 - run **parseLessons.sh** to create files from **1.json** to **6.json** (this script will run node parseLesson.js on each lesson markdown file)