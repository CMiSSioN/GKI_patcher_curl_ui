#!/system/bin/sh
CURL=$1
$CURL --fail -s --show-error "https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/dynamic/repos/repos.json"