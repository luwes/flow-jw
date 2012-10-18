#!/bin/bash
# This is a simple script that compiles the plugin using the free Flex SDK on Linux/Mac.
# Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

FLEXPATH=/Developer/SDKs/flex_sdk_3
JWPATH=/Developer/SDKs/jw6-plugin-sdk

echo "Compiling plugin..."
$FLEXPATH/bin/mxmlc ./com/wessite/Main.as \
	-sp ./ \
	-o ../flow-2.swf \
	-library-path+=$JWPATH/lib \
	-load-externs $JWPATH/lib/jwplayer-6-classes.xml \
	-use-network=false \
	-debug=false
