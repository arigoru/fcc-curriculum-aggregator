#!/bin/bash
# convert lessons into json and concat
for section in {1..6}
do 
    echo "{\"lessons-${section}\":{" > ${section}.json
    echo "STARTING SECTION $section"

    for i in english/0${section}*/*/*.md;do 
        echo "$i"
        echo "$(cat $i | node parseLesson.js)""," >> ${section}.json;
    done
    #remove last ","
    if [ -n "$(tail -c1 ${section}.json)" ]
    then
     truncate -s-1 ${section}.json
    else
     truncate -s-2 ${section}.json
    fi
    echo "}}" >> ${section}.json
done