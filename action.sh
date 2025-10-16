#!/system/bin/sh

log() { echo $1; }

volupkey='KEY_VOLUMEUP'
voldownkey='KEY_VOLUMEDOWN'
LOCALE=$(getprop persist.sys.locale)
LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/$LOCALE.sh"
if ! [ -e $LOCALE_FILE ]; then
  LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/en-US.sh"
fi
source "$LOCALE_FILE"

log "$STR_WELLCOME_MESSAGE"
log "
$STR_RAW_KERNEL_VERSION $(cat /proc/version)

"

TMPDIR="/data/local/tmp/ksu_flash"
WORKDIR="$TMPDIR/work"
ZIP="$TMPDIR/kernel.zip"
 "$STR_TEMP_DIR_PREPARE $TMPDIR"
rm -rf "$TMPDIR"
mkdir -p "$TMPDIR"
CURL="curl"
MODPATH="/data/adb/modules/gki_patcher_curl_ui"
case $(getprop ro.product.cpu.abi) in
  arm64-v8a)
    ARCH="arm64"
  ;;
  armeabi-v7a)
    ARCH="arm"
  ;;
  armeabi)
    ARCH="arm"
  ;;
  x86)
    ARCH="x86"
  ;;
  x86_64)
    ARCH="x64"
  ;;
esac
if ! curl --version > /dev/null; then
  log "$STR_SWITCH_TO_INTERNAL_CURL"
  cp $MODPATH/system/bin/curl-$ARCH $TMPDIR/curl-$ARCH
  chmod a+x $TMPDIR/curl-$ARCH
  CURL="$TMPDIR/curl-$ARCH --dns-servers 8.8.8.8"
fi
echo $CURL
echo $MODPATH
# URL для проверки доступа
url="https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases?per_page=2"

log "$STR_GITHUB_API_CHECK"
if ! $CURL --silent --head --fail "$url" > /dev/null; then
cat <<EOF
$STR_GITHUB_API_FAIL
EOF
    exit 1
fi

MODULEBASE=$MODPATH

if [ -f /data/adb/gki_patcher_curl_ui/action_repo.sh ]; then
  source /data/adb/gki_patcher_curl_ui/action_repo.sh
else
  source $MODULEBASE/init_settings.sh
  source /data/adb/gki_patcher_curl_ui/action_repo.sh
fi

if [ -z "$ARCHIVE_URL" ]; then
  exit 1
fi

log "$STR_SEARCHING_KERNEL_SUCCESS: $(basename "$ARCHIVE_URL")"

cat <<EOF
$STR_USER_APROVE_MESSAGE
EOF

while true; do
  event="$(getevent -lqn -c1)"
  if echo "${event}" | grep -q "${volupkey}.*DOWN"; then
    break
  elif echo "${event}" | grep -q "${voldownkey}.*DOWN"; then
    exit 0
  fi
done

log "$STR_BEGIN_DOWNLOAD"
$CURL -L -o "$ZIP" "$ARCHIVE_URL"
[ $? -ne 0 ] && { log "❌ $STR_DOWNLOAD_FAIL"; exit 1; }

log "$STR_DOWNLOAD_SUCCESS $ZIP"
log "$STR_UNPACKING"
mkdir -p "$WORKDIR"
unzip -p "$ZIP" tools*/busybox > "$WORKDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$WORKDIR/update-binary"
chmod 755 "$WORKDIR/busybox" "$WORKDIR/update-binary"

log "$STR_MOUNTING"
TMP="$WORKDIR/tmp"
"$WORKDIR/busybox" mkdir -p "$TMP"
"$WORKDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "$STR_EXECUTING"
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
#"$WORKDIR/busybox" echo success-busybox
RC=$?

log "$STR_UNMOUNTING"
"$TMPDIR/busybox" umount "$TMP"
sleep 1
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

log "$STR_UNPACKING"
mkdir -p "$WORKDIR"
unzip -p "$ZIP" tools*/busybox > "$WORKDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$WORKDIR/update-binary"
chmod 755 "$WORKDIR/busybox" "$WORKDIR/update-binary"

log "$STR_MOUNTING"
TMP="$WORKDIR/tmp"
"$WORKDIR/busybox" mkdir -p "$TMP"
"$WORKDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"
log "$STR_EXECUTING"
AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
#"$WORKDIR/busybox" echo success-busybox
RC=$?

log "$STR_UNMOUNTING"
"$WORKDIR/busybox" umount "$TMP"
rm -Rf "$WORKDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ $STR_INACTIVE_SUCCESS

  "
else
  log "
   ❌ $STR_INACTIVE_FAIL

     "
fi

rm -rf "$TMPDIR"

exit $RC
