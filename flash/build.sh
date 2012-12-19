#!/bin/sh
# This is a simple script that compiles the plugin using the free Flex SDK on Linux/Mac.
# Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

cd $(dirname $0)

FLEXPATH=/Developer/SDKs/flex_sdk_3
JWPATH=/Developer/SDKs/jw6-plugin-sdk

echo "Compiling..."
$FLEXPATH/bin/mxmlc ./flow/Main.as \
	-sp ./ \
	-o ../flow.swf \
	-library-path+=$JWPATH/lib \
	-load-externs $JWPATH/lib/jwplayer-6-classes.xml \
	-use-network=false \
	-debug=false
