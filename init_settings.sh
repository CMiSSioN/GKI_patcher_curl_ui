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

REPOID=0

if [[ "$IS_ONEPLUS" == "1" ]]; then
  REPOID=0
else 
  REPOID=1
fi

update_repo_uiname() {
  case $REPOID in
    0) REPOUI_NAME="WildKernels(OnePlus-WKSU)" ;;
    1) REPOUI_NAME="KernelSU-Next(GKI-KSUN)" ;;
    2) REPOUI_NAME="WildKernels(GKI-WKSU)" ;;
    3) REPOUI_NAME="ShirkNeko(GKI-SukiSU)" ;;
    4) REPOUI_NAME="MiRinFork(GKI-SukiSU)" ;;
    5) REPOUI_NAME="zzh20188(GKI-SukiSU)" ;;
	*) REPOUI_NAME="unknown" ;;
  esac
}

update_repo_uiname

log "$STR_AVAILABLE_REPOS:"
log "1. WildKernels(OnePlus-WKSU)"
log "2. KernelSU-Next(GKI-KSUN)"
log "3. WildKernels(GKI-WKSU)"
log "4. ShirkNeko(GKI-SukiSU)"
log "5. MiRinFork(GKI-SukiSU)"
log "6. zzh20188(GKI-SukiSU)"

cat <<EOF
$STR_USER_SWITCH_MESSAGE  
EOF
log "$STR_CURRENT_REPO: $REPOUI_NAME"
while true; do
  event="$(getevent -lqn -c1)"
  if echo "${event}" | grep -q "${volupkey}.*DOWN"; then
    break
  elif echo "${event}" | grep -q "${voldownkey}.*DOWN"; then
    REPOID=$(expr $REPOID + 1)
	if [[ $REPOID -ge 6 ]]; then
	  REPOID=0
	fi
	update_repo_uiname
	log "$STR_CURRENT_REPO: $REPOUI_NAME"
  fi
done

mkdir -p /data/adb/gki_patcher_curl_ui
echo -n $REPOID > /data/adb/gki_patcher_curl_ui/repoid.txt
cp -f $MODULEBASE/repos/$REPOID.sh /data/adb/gki_patcher_curl_ui/action_repo.sh