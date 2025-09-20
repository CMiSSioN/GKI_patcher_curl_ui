#!/system/bin/sh

log() { echo "$1"; }

log "Старт скрипта патчинга KernelSU Next"
CURL="$1"
ARCHIVE_URL="$2"
DRY_RUN=$3
ACTIVE_SLOT=$4
INACTIVE_SLOT=$5
TMPDIR="/data/local/tmp/ksu_flash"
ZIP="$TMPDIR/kernel.zip"
log "Подготовка временной директории $TMPDIR"
rm -rf "$TMPDIR"
mkdir -p "$TMPDIR"
log "CURL:$CURL"
log "URL:$ARCHIVE_URL"
log "DRY_RUN:$DRY_RUN"
log "ACTIVE_SLOT:$ACTIVE_SLOT"
log "INACTIVE_SLOT:$INACTIVE_SLOT"
url="https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"

log "Проверка доступа к Github.api" 
if ! $CURL --silent --head --fail "$url" > /dev/null; then
    cat <<EOF
  | Github.api недоступен
  | Отключите блокировщик рекламы 
  | Попробуйте включить VPN или сменить провайдера
   
EOF
    exit 1
fi

$CURL -L -o "$ZIP" "$ARCHIVE_URL"
[ $? -ne 0 ] && { log "❌ Ошибка скачивания"; exit 1; }

log "Архив скачан в $ZIP"
log "Извлечение busybox и update-binary из архива..."
unzip -p "$ZIP" tools*/busybox > "$TMPDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$TMPDIR/update-binary"
chmod 755 "$TMPDIR/busybox" "$TMPDIR/update-binary"

if [ $DRY_RUN -eq 1 ]; then
  log "Архив с ядром успешно скачан и распакован"
  exit 0
fi

if [ $ACTIVE_SLOT -eq 1 ]; then
log "Установка в активный слот"
log "Создаю tmpfs и монтирую..."
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "Запускаю update-binary для установки ядра"
log "Это может занять некоторое время..."
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

log "Завершаю работу и очищаю временные файлы..."
"$TMPDIR/busybox" umount "$TMP"
"$TMPDIR/busybox" rm -rf "$TMPDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ Ядро успешно установлено в активный слот

  "
else
  log "
   ❌ Ядро не установлено
 
  "
fi

fi

if [ $INACTIVE_SLOT -eq 1 ]; then
log "Установка в неактивный слот"
log  "Создаю tmpfs и монтирую..."
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "Запускаю update-binary для установки ядра"
log "Это может занять некоторое время..."
AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

log "Завершаю работу и очищаю временные файлы..."
"$TMPDIR/busybox" umount "$TMP"
"$TMPDIR/busybox" rm -rf "$TMPDIR"

if [ $RC -eq 0 ]; then
  log "
   ✅ Ядро установлено поверх ОТА

  "
else 
  log "
   ❌ Используется только после ОТА
 
     "
fi
fi
exit $RC
