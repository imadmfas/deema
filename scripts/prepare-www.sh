#!/usr/bin/env sh
# ينسخ ملفات اللعبة إلى www/ ليستعملها Capacitor
set -e
rm -rf www && mkdir www
cp -r index.html sw.js manifest.webmanifest js css data audio assets fonts vendor icons www/
