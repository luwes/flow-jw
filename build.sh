#!/bin/sh

cd $(dirname $0)

echo "Compiling..."
uglifyjs2 src/Tween.js \
          src/flow.js \
          -o flow.js -m
	