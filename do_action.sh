#!/system/bin/sh
MODULEROOT=/data/adb/modules/gki_patcher_curl_ui
log() { echo "$1"; }

zip_replace_file() (
    zip_archive="$1"
    file_to_replace="$2"
    new_file_path="$3"    
    target_index=""
    total_entries=$(ziptool "$zip_archive" get_num_entries 0 | tr -d '\r\n')
    i=0
    while [ "$i" -lt "$total_entries" ]; do
        current_name=$(ziptool "$zip_archive" stat "$i" | grep '^name:' | cut -d"'" -f2)
        
        if [ "$current_name" = "$file_to_replace" ]; then
            target_index="$i"
            break
        fi
        i=$((i + 1))
    done
    if [ -n "$target_index" ]; then
        ziptool "$zip_archive" delete "$target_index" add_file "$file_to_replace" "$new_file_path" 0 -1
        return 0
    else
        log "File '$file_to_replace' not found"
        return 2
    fi
)

LOCALE=$(getprop persist.sys.locale)
LOCALE_FILE="$MODULEROOT/webroot/lang/$LOCALE.sh"
if ! [ -e $LOCALE_FILE ]; then
  LOCALE_FILE="$MODULEROOT/webroot/lang/en-US.sh"
fi
source "$LOCALE_FILE"

log "$STR_WELLCOME_MESSAGE"
CURL="$1"
ARCHIVE_URL="$2"
DRY_RUN=$3
ACTIVE_SLOT=$4
INACTIVE_SLOT=$5
BYPASS_MODE=$6
WRITE_SIMULATE_MODE=$7
ZIPUTL=$MODULEROOT/system/bin/zip
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
log "USE BYPASS IMAGE:$BYPASS_MODE"
url="https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"

log "$STR_GITHUB_API_CHECK"
#$CURL --head --fail "$url"
if ! $CURL --silent --head --fail "$url" > /dev/null; then
    log "$STR_GITHUB_API_FAIL"
    exit 1
fi

$CURL -L -o "$ZIP" "$ARCHIVE_URL"
[ $? -ne 0 ] && { log "❌ $STR_DOWNLOAD_FAIL"; exit 1; }

log "$STR_DOWNLOAD_SUCCESS $ZIP"
log "$STR_UNPACKING"
#rm -f $ZIP || true
#ZIP=/data/local/tmp/gki_patcher_debug/5.15.151-android13-2024-08-AnyKernel3.zip
#cp /data/local/tmp/gki_patcher_debug/o5.15.151-android13-2024-08-AnyKernel3.zip "$TMPDIR/kernel.zip"
mkdir -p "$WORKDIR"
unzip -p "$ZIP" tools*/busybox > "$WORKDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$WORKDIR/update-binary"
chmod 755 "$WORKDIR/busybox" "$WORKDIR/update-binary"
if [ $BYPASS_MODE -eq 1 ]; then
  unzip -p "$ZIP" anykernel.sh > "$WORKDIR/anykernel.sh"
  CUR_DIR=$(pwd)
  cd $WORKDIR
  sed -i '/do.devicecheck=0/a do.flash_bypass=1' "$WORKDIR/anykernel.sh"
  if $ZIPUTL -u $ZIP anykernel.sh; then
	cd $CUR_DIR
	log "File updated successfuly"
  else
	cd $CUR_DIR
	log "File update fail"
	exit 1;
  fi
fi

if [ $DRY_RUN -eq 1 ]; then
  CUR_DIR=$(pwd)
  cd "$WORKDIR"
  mkdir tools
  unzip -p "$ZIP" tools/ak3-core.sh > "tools/ak3-core.sh"
  sed -i 's/^\(.*flash_erase \$BLOCK 0 0\;.*\)/#\1/' tools/ak3-core.sh
  sed -i 's/^\(.*flash_erase \$imgblock 0 0\;.*\)/#\1/' tools/ak3-core.sh
  sed -i '/nandwrite -p $BLOCK boot-new.img\;/a ui_print \"simulating nandwrite to \$BLOCK\"' tools/ak3-core.sh
  sed -i 's/^\(.*nandwrite -p \$BLOCK boot-new\.img\;.*\)/#\1/' tools/ak3-core.sh
  sed -i '/nandwrite -p $imgblock $img\;/a ui_print \"simulating nandwrite \$img to \$imgblock\"' tools/ak3-core.sh
  sed -i 's/^\(.*nandwrite -p \$imgblock \$img\;.*\)/#\1/' tools/ak3-core.sh

  sed -i 's/^\(.*dd if=\/dev\/zero of=\$BLOCK \$CUSTOMDD 2>\/dev\/null\;.*\)/#\1/' tools/ak3-core.sh
  sed -i 's/^\(.*dd if=\/dev\/zero of=\$imgblock 2>\/dev\/null\;.*\)/#\1/' tools/ak3-core.sh
  sed -i '/dd if=boot-new.img of=$BLOCK $CUSTOMDD\;/a ui_print \"simulating dd to \$BLOCK\"' tools/ak3-core.sh
  sed -i 's/^\(.*dd if=boot-new\.img of=\$BLOCK \$CUSTOMDD\;.*\)/#\1/' tools/ak3-core.sh
  sed -i '/dd if=$img of=$imgblock\;/a ui_print \"simulating dd \$img to \$imgblock\"' tools/ak3-core.sh
  sed -i 's/^\(.*dd if=\$img of=\$imgblock\;.*\)/#\1/' tools/ak3-core.sh

  sed -i '/cat boot-new.img \/dev\/zero > $BLOCK 2>\/dev\/null || true\;/a ui_print \"simulating cat to \$BLOCK\"' tools/ak3-core.sh
  sed -i 's/^\(.*cat boot-new\.img \/dev\/zero > \$BLOCK 2>\/dev\/null || true\;.*\)/#\1/' tools/ak3-core.sh
  sed -i '/cat $img \/dev\/zero > $imgblock 2>\/dev\/null || true\;/a ui_print \"simulating cat \$img to \$imgblock\"' tools/ak3-core.sh
  sed -i 's/^\(.*cat \$img \/dev\/zero > \$imgblock 2>\/dev\/null || true\;.*\)/#\1/' tools/ak3-core.sh

  $ZIPUTL -u $ZIP tools/ak3-core.sh
  cd "$CUR_DIR"
fi

#exit 0

#if [ $DRY_RUN -eq 1 ]; then
#  log "$STR_DRY_RUN_SUCCESS"
#  rm -rvf "$TMPDIR"
#  exit 0
#fi
RC=0

if [ $ACTIVE_SLOT -eq 1 ]; then
log "$STR_ACTIVE_SLOT_INSTALL"
log "$STR_MOUNTING"
TMP="$WORKDIR/tmp"
"$WORKDIR/busybox" mkdir -p "$TMP"
"$WORKDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "$STR_EXECUTING"
log "$STR_WAIT"
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP"
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
fi

if [ $INACTIVE_SLOT -eq 1 ]; then
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
AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$WORKDIR/busybox" ash "$WORKDIR/update-binary" 3 1 "$ZIP"
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
