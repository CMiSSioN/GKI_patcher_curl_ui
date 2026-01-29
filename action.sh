#!/system/bin/sh
# Action script for opening Github

WEB_LINK="https://github.com/CMiSSioN/GKI_patcher_curl_ui/releases/latest"

ui_print "- Opening Github..."
ui_print "  $WEB_LINK"

if [ $? -ne 0 ]; then
  su -c "am start -a android.intent.action.VIEW -d '$WEB_LINK'" >/dev/null 2>&1
fi