#!/system/bin/sh

log() { echo "$1"; }

 "Старт скрипта патчинга KernelSU Next"
log "
Необработанная версия ядра: $(cat /proc/version)

"
KERNEL_VERSION=$(sed -n 's/Linux version \(.*\).*/\1/p' /proc/version | cut -d'-' -f1-2)
FORMATTED_VERSION=$(echo $KERNEL_VERSION | awk -F'-' '{print "-"$2"-"$1}')
log "Текущая версия ядра: $FORMATTED_VERSION"

TMPDIR="/data/local/tmp/ksu_flash"
ZIP="$TMPDIR/kernel.zip"
 "Подготовка временной директории $TMPDIR"
rm -rf "$TMPDIR"
mkdir -p "$TMPDIR"
CURL="curl"
MODPATH="/data/adb/modules/gki_patcher"
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
  log "Системный curl отсутствует. Переключаюсь на встроенный"
  cp $MODPATH/system/bin/curl-$ARCH $TMPDIR/curl-$ARCH
  chmod a+x $TMPDIR/curl-$ARCH
  CURL="$TMPDIR/curl-$ARCH --dns-servers 8.8.8.8"
fi
echo $CURL
echo $MODPATH
# URL для проверки доступа
url="https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"

log "Проверка доступа к Github.api" 
if ! $CURL --silent --head --fail "$url" > /dev/null; then
    cat <<EOF
  | Github.api недоступен
  | Отключите блокировщик рекламы 
  | Попробуйте включить VPN
   
EOF
    exit 1
fi

log "Получение списка релизов из репозитория WildKernels/GKI_KernelSU_SUSFS"
$CURL -s "https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases" > "$TMPDIR/releases.json"

log "Поиск ядра '$FORMATTED_VERSION' в релизах..."
ARCHIVE_URL=$(grep -oE '"browser_download_url": *"[^"]*'"$FORMATTED_VERSION"'[^"]*\.zip"' "$TMPDIR/releases.json" \
  | head -n 1 \
  | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')

if [ -z "$ARCHIVE_URL" ]; then
  log "❌ Не найдено подходящее ядро для версии $FORMATTED_VERSION"
  exit 1
fi

log "Найден архив для ядра: $ARCHIVE_URL"
log "Начинаю скачивание..."
$CURL -L -o "$ZIP" "$ARCHIVE_URL"
[ $? -ne 0 ] && { log "❌ Ошибка скачивания"; exit 1; }

log "Архив скачан в $ZIP"
log "Извлечение busybox и update-binary из архива..."
unzip -p "$ZIP" tools*/busybox > "$TMPDIR/busybox"
unzip -p "$ZIP" META-INF/com/google/android/update-binary > "$TMPDIR/update-binary"
chmod 755 "$TMPDIR/busybox" "$TMPDIR/update-binary"

log "Создаю tmpfs и монтирую..."
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

log "Запускаю update-binary для установки ядра..."
AKHOME="$TMP/anykernel" SLOT_SELECT=active "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

 "Создаю tmpfs и монтирую..."
TMP="$TMPDIR/tmp"
"$TMPDIR/busybox" mkdir -p "$TMP"
"$TMPDIR/busybox" mount -t tmpfs -o noatime tmpfs "$TMP"

if [ $RC -eq 0 ]; then
  log "
   ✅ Ядро успешно установлено в активный слот

  "
else
  log "
   ❌ Ядро не установлено
 
  "
fi

AKHOME="$TMP/anykernel" SLOT_SELECT=inactive "$TMPDIR/busybox" ash "$TMPDIR/update-binary" 3 1 "$ZIP" > /dev/null 2>&1
RC=$?

 "Завершаю работу и очищаю временные файлы..."
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

$RC
