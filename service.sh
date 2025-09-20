#!/system/bin/sh
while [ "$(getprop sys.boot_completed)" != "1" ]; do
	sleep 1;
done

# Очищаю временные файлы..."
rm -rf /data/local/tmp/ksu_flash