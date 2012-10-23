#!/bin/sh

cd $(dirname $0)

echo "Compiling..."
uglifyjs2 src/Tween.js \
          src/flow-2.js \
          -o flow-2.js -m
	