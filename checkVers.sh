#!/bin/bash
ls -la /mnt/nasCons/Nexus/DMSWEBSperimentali | grep dmsweb-wa > vers.txt
cut vers.txt -c 55-60 > lastVersWEB.txt
rm vers.txt
ls -la /mnt/nasCons/Nexus/DMSCSSperimentali/DMSEMA > versCS.txt
cut versCS.txt -c 44-50 > lastVersCS.txt
rm versCS.txt
ls -la /mnt/nasCons/Nexus/DMSWEBSperimentali/ | grep dmsweb-doctor > versDoc.txt
cut versDoc.txt -c 59-64 > lastVersDOC.txt
rm versDoc.txt
