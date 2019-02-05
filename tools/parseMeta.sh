#!/bin/bash
# concat all curriculum meta json files into one
# clean meta file first
echo "{" > meta.json
for i in _meta/*/*.json;do echo "$(cat $i)""," >> meta.json;done
echo "}" >> meta.json
