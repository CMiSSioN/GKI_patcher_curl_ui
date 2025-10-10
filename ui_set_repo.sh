#!/system/bin/sh
REPOID=$1
MODULEBASE=/data/adb/modules/gki_patcher_curl_ui
mkdir -p /data/adb/gki_patcher_curl_ui
echo -n $REPOID > /data/adb/gki_patcher_curl_ui/repoid.txt
cp -f $MODULEBASE/repos/$REPOID.sh /data/adb/gki_patcher_curl_ui/action_repo.sh