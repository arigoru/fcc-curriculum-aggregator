#!/bin/bash
# convert lessons into json and concat
for section in {1..6}
do 
    #for i in english/01*/*.json;do echo "$(cat $i)""," >> out.txt;done
    echo "curriculum[${section}-1].lessons={" > ${section}.js
    echo "STARTING SECTION $section"

    for i in english/0${section}*/*/*.md;do 
        echo "$i"
        echo "$(cat $i | node parseLesson.js)""," >> ${section}.js;
    done
    echo "}" >> ${section}.js
done
