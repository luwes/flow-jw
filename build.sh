#!/bin/sh

cd $(dirname $0)

java -jar /usr/local/bin/compiler/compiler.jar \
	--js=src/Tween.js \
	--js=src/flow-2.js \
	--js_output_file=flow-2.js \
	--output_wrapper "" \
	#--compilation_level ADVANCED_OPTIMIZATIONS \
	