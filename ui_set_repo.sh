#!/system/bin/sh
REPOID=$1
CURL=$2
#MODULEBASE=/data/adb/modules/gki_patcher_curl_ui
REMOTE_LOGIC_URL="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master"
#REMOTE_LOGIC="/data/adb/gki_patcher_curl_ui"
mkdir -p /data/adb/gki_patcher_curl_ui
echo -n $REPOID > /data/adb/gki_patcher_curl_ui/repoid.txt
$CURL -s --show-error -o "/data/adb/gki_patcher_curl_ui/action_repo.sh" "$REMOTE_LOGIC_URL/dynamic/repos/$REPOID.sh"
[ $? -ne 0 ] && { exit 1; }
exit 0
#cp -f $MODULEBASE/repos/$REPOID.sh /data/adb/gki_patcher_curl_ui/action_repo.sh