#!/bin/bash
# concat all curriculum meta json files into one
# clean meta file first
echo "{\"curriculumMetaRaw\" : [" > meta.json
for i in _meta/*/*.json;do echo "$(cat $i)""," >> meta.json;done
#remove last ","
if [ -n "$(tail -c1 meta.json)" ]
then
  truncate -s-1 meta.json
else
  truncate -s-2 meta.json
fi
echo "]}" >> meta.json