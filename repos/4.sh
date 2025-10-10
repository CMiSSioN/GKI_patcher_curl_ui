RELEASES_URL="https://api.github.com/repos/MiRinFork/GKI_SukiSU_SUSFS/releases?per_page=2"
KERNEL_VERSION=$(sed -n 's/Linux version \(.*\).*/\1/p' /proc/version | cut -d'-' -f1-2)
FORMATTED_VERSION=$(echo $KERNEL_VERSION | awk -F'-' '{print $2"-"$1}')
SEARCH_KEYWORD="$FORMATTED_VERSION"
log "$STR_CURRENT_KERNEL_VERSION: $FORMATTED_VERSION"
log "$STR_SEARCHING_KERNEL_PREFIX '$SEARCH_KEYWORD' $STR_SEARCHING_KERNEL_SUFFIX"
log "$STR_KERNEL_VERSIONS_REPO_MESSAGE MiRinFork/GKI_SukiSU_SUSFS"
$CURL -s "$RELEASES_URL" > "$TMPDIR/releases.json"
log "$STR_SEARCHING_KERNEL_PREFIX '$SEARCH_KEYWORD' $STR_SEARCHING_KERNEL_SUFFIX"
ARCHIVE_URL=$(grep -oE '"browser_download_url": *"[^"]*'"$SEARCH_KEYWORD"'[^"]*\.zip"' "$TMPDIR/releases.json" \
  | head -n 1 \
  | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')  
if [ -z "$ARCHIVE_URL" ]; then
  log "❌ $STR_SEARCHING_KERNEL_FAIL $SEARCH_KEYWORD"
  #exit 0
fi

