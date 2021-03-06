#!/bin/bash

# Export all objects matching identifier in SVG to PNG

INKSCAPE="/Applications/Inkscape.app/Contents/MacOS/Inkscape"
IDENTIFIER="x:" # Groups with IDs beginning with this will be exported

SRC_PATH="src.svg"
DEST_PATH="output"

ALL_OBJECTS=$(exec $INKSCAPE -S $SRC_PATH)
EXPORT_OBJECTS=""


# Build semicolon-delimited list of object IDs to export
for obj in $ALL_OBJECTS
do
    if [[ $obj =~ $IDENTIFIER ]]
    then
        EXPORT_OBJECTS+=";$(echo $obj | cut -d "," -f 1)"
    fi
done

EXPORT_OBJECTS=$(echo $EXPORT_OBJECTS | cut -c 2-)  # Remove leading semicolon

$(exec $INKSCAPE --export-type="png" --export-id="$EXPORT_OBJECTS" $SRC_PATH)

for src in *.png
do
    dest="$DEST_PATH/$(echo $src | sed 's/^.*x://')"
    mv $src $dest
done

rm "src_out.svg"









