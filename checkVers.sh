#!/bin/bash
ls -lt /mnt/nasCons/Nexus/DMSWEBSperimentali | grep dmsweb-x64 > vers.txt
cut vers.txt -c 58-63 > lastVers.txt
sed -n '1p' lastVers.txt > lastDMSWeb.txt
rm vers.txt
rm lastVers.txt
ls -lt /mnt/nasCons/Nexus/DMSCSSperimentali/DMSEMA > vers.txt
cut versCS.txt -c 63-66 > lastVersCS.txt
sed -n '2p' lastVersCS.txt > lastDMSCS.txt
rm versCS.txt
rm lastVersCS.txt
