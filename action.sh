#!/system/bin/sh

log() { echo "$1"; }

volupkey='KEY_VOLUMEUP'
voldownkey='KEY_VOLUMEDOWN'
LOCALE=$(getprop persist.sys.locale)
LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/$LOCALE.sh"
if ! [ -e $LOCALE_FILE ]; then
  LOCALE_FILE="/data/adb/modules/gki_patcher_curl_ui/webroot/lang/en-US.sh"
fi
source "$LOCALE_FILE"
#source "/data/adb/modules/gki_patcher_curl_ui/webroot/lang/$LOCALE.sh"

log "$STR_WELLCOME_MESSAGE"
log "
$STR_RAW_KERNEL_VERSION $(cat /proc/version)

"

MODEL_RAW=$(getprop ro.product.model)
log "$STR_DEVICE_MODEL: '$MODEL_RAW'"
IS_ONEPLUS="1"
case "$MODEL_RAW" in
  PJA110) SEARCH_KEYWORD="OP-ACE-2-PRO_" ;;
  PHK110|PHK110YS) SEARCH_KEYWORD="OP-ACE-2_" ;;
  PKG110) SEARCH_KEYWORD="OP-ACE-5_" ;;
  CPH2661|RMX3852|RMX3851|CPH2663) SEARCH_KEYWORD="OP-NORD-4_" ;;
  PHN110|CPH2551|CPH2499) SEARCH_KEYWORD="OP-OPEN_" ;;
  OPD2404|OPD2403) SEARCH_KEYWORD="OP-PAD-2_" ;;
  NE2210|NE2211|NE2213|NE2215|NE2217) SEARCH_KEYWORD="OP10pro_" ;;
  RMX3709|CPH2413|CPH2415|CPH2417|CPH2419) SEARCH_KEYWORD="OP10t_" ;;
  CPH2487) SEARCH_KEYWORD="OP11r_" ;;
  PHB110|CPH2447|CPH2449|CPH2451) SEARCH_KEYWORD="OP11_" ;;
  CPH2585|CPH2609|CPH2611) SEARCH_KEYWORD="OP12r_" ;;
  CPH2573|CPH2581|RMX3800|CPH2583) SEARCH_KEYWORD="OP12_" ;;
  RMX5011|CPH2655|CPH2653|CPH2649) SEARCH_KEYWORD="OP13_" ;;
  CPH2645|CPH2647|CPH2691) SEARCH_KEYWORD="OP13r_" ;;
  CPH2723) SEARCH_KEYWORD="OP13S_" ;;
  CPH2621|PJF110) SEARCH_KEYWORD="OP-ACE-3V" ;;
#  "Armor 25T Pro") SEARCH_KEYWORD="OP-ACE-3V" ;;
  *) IS_ONEPLUS="0" ;;
esac

#log "IS_ONEPLUS:$IS_ONEPLUS"

if [[ "$IS_ONEPLUS" == "1" ]]; then
  log "$STR_IS_ONEPLUS"
else
  log "$STR_IS_NOT_ONEPLUS"
fi
log "$STR_USER_INPUT_MESSAGE"

while true; do
  event="$(getevent -lqn -c1)"
  if echo "${event}" | grep -q "${volupkey}.*DOWN"; then
    break
  elif echo "${event}" | grep -q "${voldownkey}.*DOWN"; then
    [[ "$IS_ONEPLUS" == "1" ]] && IS_ONEPLUS="0" || IS_ONEPLUS="1"
    break
  fi
done

RELEASES_URL=""
if [[ "$IS_ONEPLUS" == "1" ]]; then
  RELEASES_URL="https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases"
else
  RELEASES_URL="https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"
fi

KERNEL_VERSION=$(sed -n 's/Linux version \(.*\).*/\1/p' /proc/version | cut -d'-' -f1-2)
FORMATTED_VERSION=$(echo $KERNEL_VERSION | awk -F'-' '{print "-"$2"-"$1}')
log "$STR_CURRENT_KERNEL_VERSION: $FORMATTED_VERSION"

TMPDIR="/data/local/tmp/ksu_flash"
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
url="$RELEASES_URL"

log "$STR_GITHUB_API_CHECK"
if ! $CURL --silent --head --fail "$url" > /dev/null; then
    log "$STR_GITHUB_API_FAIL"
    exit 1
fi

log "$STR_KERNEL_VERSIONS_REPO_MESSAGE WildKernels/GKI_KernelSU_SUSFS"
$CURL -s "$RELEASES_URL" > "$TMPDIR/releases.json"

if [[ "$IS_ONEPLUS" == "0" ]]; then
  SEARCH_KEYWORD="$FORMATTED_VERSION"
fi

log "$STR_SEARCHING_KERNEL_PREFIX '$SEARCH_KEYWORD' $STR_SEARCHING_KERNEL_SUFFIX"
ARCHIVE_URL=$(grep -oE '"browser_download_url": *"[^"]*'"$SEARCH_KEYWORD"'[^"]*\.zip"' "$TMPDIR/releases.json" \
  | head -n 1 \
  | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')  
if [ -z "$ARCHIVE_URL" ]; then
  log "❌ $STR_SEARCHING_KERNEL_FAIL $SEARCH_KEYWORD"
  exit 0
fi

log "$STR_SEARCHING_KERNEL_SUCCESS: $(basename "$ARCHIVE_URL")"
log "$STR_USER_APROVE_MESSAGE"
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
unzip -p "$ZIP" tools*/busybox > "$TMPDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$TMPDIR/update-binary"
chmod 755 "$TMPDIR/busybox" "$TMPDIR/update-binary"

log "$STR_MOUNTING"
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "$STR_EXECUTING"
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

log "$STR_MOUNTING"
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

if [ $RC -eq 0 ]; then
  log "
   ✅ $STR_ACTIVE_SUCCESS

  "
else
  log "
   ❌ $STR_ACTIVE_FAIL

  "
fi

AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

log "$STR_UNMOUNTING"
"$TMPDIR/busybox" umount "$TMP"
"$TMPDIR/busybox" rm -rf "$TMPDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ $STR_INACTIVE_SUCCESS

  "
else
  log "
   ❌ $STR_INACTIVE_FAIL

     "
fi

$RC
