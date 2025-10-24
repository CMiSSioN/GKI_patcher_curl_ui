mkdir -p /data/adb/gki_patcher_curl_ui
REPOID=0
SH_REPOS_COUNT=0
REMOTE_LOGIC_URL="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master"
REMOTE_LOGIC="/data/adb/gki_patcher_curl_ui"

log "$STR_UPDATING_REPOS_INFO..."
$CURL -s --show-error -o "$REMOTE_LOGIC/dynamic_settings.sh" "$REMOTE_LOGIC_URL/dynamic/dynamic_settings.sh"
[ $? -ne 0 ] && { log "❌ $STR_DOWNLOAD_FAIL"; exit 1; }

source $REMOTE_LOGIC/dynamic_settings.sh

REPO_COUNTER=0
mkdir -p $REMOTE_LOGIC/repos

while [ "$REPO_COUNTER" -lt "$SH_REPOS_COUNT" ]; do
  $CURL -s --show-error --fail -o "$REMOTE_LOGIC/repos/$REPO_COUNTER.sh" "$REMOTE_LOGIC_URL/dynamic/repos/$REPO_COUNTER.sh"
  [ $? -ne 0 ] && { log "$REMOTE_LOGIC_URL/dynamic/repos/$REPO_COUNTER.sh"; log "❌ $STR_DOWNLOAD_FAIL"; break; }
  REPO_COUNTER=$((REPO_COUNTER + 1))
done

cat <<EOF
$STR_USER_SWITCH_MESSAGE  
EOF
log "$STR_CURRENT_REPO: $REPOUI_NAME"
while true; do
  event="$(getevent -lqn -c1)"
  if echo "${event}" | grep -q "${volupkey}.*DOWN"; then
    break
  elif echo "${event}" | grep -q "${voldownkey}.*DOWN"; then
    REPOID=$(expr $REPOID + 1)
	if [[ $REPOID -ge 6 ]]; then
	  REPOID=0
	fi
	update_repo_uiname
	log "$STR_CURRENT_REPO: $REPOUI_NAME"
  fi
done

echo -n $REPOID > /data/adb/gki_patcher_curl_ui/repoid.txt
cp -f $REMOTE_LOGIC/repos/$REPOID.sh /data/adb/gki_patcher_curl_ui/action_repo.sh