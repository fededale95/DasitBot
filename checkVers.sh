#!/bin/bash
ls -lt /mnt/nastest/DMSWEB | grep dmsweb-x64 > vers.txt
cut vers.txt -c 58-63 > lastVers.txt
sed -n '1p' lastVers.txt > lastDMSWeb.txt
rm vers.txt
rm lastVers.txt

#manca parte DMSCS
