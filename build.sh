#!/bin/sh

cd $(dirname $0)

echo "Compiling..."
uglifyjs2	src/Tween.js \
			src/main.js \
			src/coverflow.js \
			src/cover.js \
			src/touchcontroller.js \
			src/delegate.js \
			src/utils.js \
			-o flow.js -m
	