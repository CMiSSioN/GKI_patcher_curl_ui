#!/system/bin/sh

log() { echo "$1"; }

LOCALE=$(getprop persist.sys.locale)
LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/$LOCALE.sh"
if ! [ -e $LOCALE_FILE ]; then
  LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/en-US.sh"
fi
source "$LOCALE_FILE"

log "$STR_WELLCOME_MESSAGE"
CURL="$1"
ARCHIVE_URL="$2"
DRY_RUN=$3
ACTIVE_SLOT=$4
INACTIVE_SLOT=$5
TMPDIR="/data/local/tmp/ksu_flash"
WORKDIR="$TMPDIR/work"
ZIP="$TMPDIR/kernel.zip"
log "$STR_TEMP_DIR_PREPARE $TMPDIR"
rm -rf "$TMPDIR"
mkdir -p "$TMPDIR"
log "CURL:$CURL"
log "URL:$ARCHIVE_URL"
log "DRY_RUN:$DRY_RUN"
log "ACTIVE_SLOT:$ACTIVE_SLOT"
log "INACTIVE_SLOT:$INACTIVE_SLOT"
url="https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"

log "$STR_GITHUB_API_CHECK"
if ! $CURL --silent --head --fail "$url" > /dev/null; then
    log "$STR_GITHUB_API_FAIL"
    exit 1
fi

$CURL -L -o "$ZIP" "$ARCHIVE_URL"
[ $? -ne 0 ] && { log "❌ $STR_DOWNLOAD_FAIL"; exit 1; }

log "$STR_DOWNLOAD_SUCCESS $ZIP"
log "$STR_UNPACKING"
mkdir -p "$WORKDIR"
unzip -p "$ZIP" tools*/busybox > "$WORKDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$WORKDIR/update-binary"
chmod 755 "$WORKDIR/busybox" "$WORKDIR/update-binary"

if [ $DRY_RUN -eq 1 ]; then
  log "$STR_DRY_RUN_SUCCESS"
  rm -rvf "$TMPDIR"
  exit 0
fi


log "$STR_ACTIVE_SLOT_INSTALL"
log "$STR_MOUNTING"
TMP="$WORKDIR/tmp"
"$WORKDIR/busybox" mkdir -p "$TMP"
"$WORKDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "$STR_EXECUTING"
log "$STR_WAIT"
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP" 1>/dev/null 2>/dev/null
RC=$?

log "$STR_UNMOUNTING"
"$WORKDIR/busybox" umount "$TMP"
rm -rf "$WORKDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ $STR_ACTIVE_SUCCESS

  "
else
  log "
   ❌ $STR_ACTIVE_FAIL

  "
fi


if [ $ACTIVE_SLOT -eq 0 ]; then
log "$STR_INACTIVE_SLOT_INSTALL"
mkdir -p "$WORKDIR"
log "$STR_UNPACKING"
unzip -p "$ZIP" tools*/busybox > "$WORKDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$WORKDIR/update-binary"
chmod 755 "$WORKDIR/busybox" "$WORKDIR/update-binary"

log "$STR_MOUNTING"
TMP="$WORKDIR/tmp"
"$WORKDIR/busybox" mkdir -p "$TMP"
"$WORKDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "$STR_EXECUTING"
log "$STR_WAIT"
AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP" 1>/dev/null 2>/dev/null
RC=$?

log "$STR_UNMOUNTING"
"$WORKDIR/busybox" umount "$TMP"
rm -rf "$WORKDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ $STR_INACTIVE_SUCCESS

  "
else
  log "
   ❌ $STR_INACTIVE_FAIL

     "
fi
fi

log "$STR_UNMOUNTING"
rm -rf "$TMPDIR"


exit $RC
