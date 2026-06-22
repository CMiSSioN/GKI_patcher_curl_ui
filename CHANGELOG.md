## v4.5
- Added Samsung KSU+SUSFS WildKernels repositary
- Added posibility to flash inactive slot only
- Added option to flash bypass kernel image (if zip-archive contains both normal and bypass images)
- Changed behavior of "download only" mode (now it will actually run update-binary but actual flashing will not happen)
- Now update-binary script output actially seen on screen instead of skiping to /dev/null
- Added zip cmd utility
## v4.4
- Fix for RMX3709
## v4.3
- The action button opens the module's GitHub
## v4 2
- Launch via action has been removed due to unstable operation and difficulty in debugging 
## v4.1
- fixed miscellaneous error in action script preventing all remote repositaries settings from been downloaded
## v4.0
- WildKernels/GKI_KernelSU_SUSFS repository regexp improved
- Kernel versions list elements now properly wraping instead of clipping (have to due to enormous WildKernels naming <manager name>-<driver version>-<susfs version>-<kmi version>-<security patch version>-<super-duper compatible fixed version>-<watever>-<anykernel etc>.zip )
- Now available repositaries list is downloading from github rather than build-in
## v3.9
- Added posibility to switch between kernel repositaries. Currently there are 6 - WildKernels/OnePlus_KernelSU_SUSFS, KernelSU-Next/KernelSU-Next, WildKernels/GKI_KernelSU_SUSFS, ShirkNeko/GKI_KernelSU_SUSFS, MiRinFork/GKI_SukiSU_SUSFS, zzh20188/GKI_KernelSU_SUSFS
- Now only 6 latest releases requested from repository making kernel select dropdown box update faster
## v3.8
- Shell scripts been slightly reworked to proper inactive slot installation
- Now you can't choose to install kernel just inactive slot in UI, only active or both
## v3.7
- In WebUI in select-box now kernel versions sorted by build descendly
- Now kernel select-box is drown by its own rather browset constol (smaller font allowed)
- Now if fail to fetch avaible releases ui shows relevant error info rather than infinate update
## v3.6
- VNDK version detection improvements
- Added ui showing current KSU (kernel driver) version
## v3.5
- Now OnePlus/Realme repositary/kernel choose logic applies only certain OnePlus/Realme models
- Now there is filter allows only last three different KSU(N) driver versions
- Now for non-pure-gki OnePlus/Realme modeles there is no kernel version check, only model name
## v3.4
- Ui improvements
- Added possibility to ignore kernel version build restriction in ui
## v3.3
- Buildin OnePlus/Realme support
- Now action asks for user interaction before kernel flashing
- Localization fixes
## v3.2
- Added EN localization
## v3.1.7
- Autoupdate infructructure
## v3.1.5 
- Initial release
