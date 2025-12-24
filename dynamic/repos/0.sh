RELEASES_URL="https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases?per_page=5"
MODEL_RAW=$(getprop ro.product.model)
log "$STR_DEVICE_MODEL: '$MODEL_RAW'"
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
  "Armor 25T Pro") SEARCH_KEYWORD="OP12r_" ;;
  *) IS_ONEPLUS="0" ;;
esac

log "$STR_SEARCHING_KERNEL_PREFIX '$SEARCH_KEYWORD' $STR_SEARCHING_KERNEL_SUFFIX"

log "$STR_KERNEL_VERSIONS_REPO_MESSAGE WildKernels/OnePlus_KernelSU_SUSFS"
variants_count=1
exit_flag=0
	
$CURL -s "$RELEASES_URL" > "$TMPDIR/releases.json"

log "$STR_SEARCHING_KERNEL_PREFIX '$SEARCH_KEYWORD' $STR_SEARCHING_KERNEL_SUFFIX"   
counter=1
variants=""
while [ $counter -lt 6 ]; do
  ARCHIVE_URL=$(grep -oE '"browser_download_url": *"[^"]*'"$SEARCH_KEYWORD"'[^"]*\.zip"' "$TMPDIR/releases.json" \
	  | head -n $counter | tail -n 1 \
	  | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')  
  counter=$((counter + 1))
  if [ -z $ARCHIVE_URL ]; then
    break
  else
    variants="$variants $ARCHIVE_URL"
  fi
done

if [ -z $variants ]; then
  ARCHIVE_URL=''
  log "❌ $STR_SEARCHING_KERNEL_FAIL $SEARCH_KEYWORD"
else
  variants="$variants Exit"
  variants_count=1
  log "Variants:"
  for ARCHIVE_URL in $variants
  do
	log "$variants_count.$(basename "$ARCHIVE_URL")"
	variants_count=$((variants_count + 1))
  done
  variants_count=$((variants_count - 1))
  log "$variants_count"

cat <<EOF
VOL+ comply
VOL- next
EOF
  
  variant=1
  while true; do
    ARCHIVE_URL=$(echo -n ${variants} | cut -d' ' -f$variant)
	log "$STR_SEARCHING_KERNEL_SUCCESS: $(basename "$ARCHIVE_URL")"
	while true; do
	  event="$(getevent -lqn -c1)"
	  if echo "${event}" | grep -q "${volupkey}.*DOWN"; then
		exit_flag=1
		break
	  elif echo "${event}" | grep -q "${voldownkey}.*DOWN"; then
		exit_flag=0
		break
	  fi
	done
	if [ $exit_flag -eq 0 ]; then
		if [ $variant -eq $variants_count ]; 
		then
			variant=1
		else
			variant=$((variant + 1))
		fi
	else
		break
	fi
  done
  log "$variant"
  if [ $variant -eq $variants_count ]; then
     exit 0
  fi
fi
