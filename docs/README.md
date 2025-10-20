**Русский** | [English](README_EN.md)

# 🧩 KernelSU GKI2 Patcher

**KernelSU GKI2 Auto-Patcher** — это модуль для **KernelSU Next**, который упрощает установку и обновление ядер AnyKernel3 на устройства с поддержкой GKI2-ядер.
Он определяет версию ядра, скачивает подходящую сборку **AnyKernel3** из выбранного репозитория и устанавливает её одним нажатием.

---

## 🔧 Возможности

- 🔍 **Автоматическое определение версии ядра** (GKI2)
- 📥 **Загрузка нужного AnyKernel3** с GitHub
- ⚡ **Установка в один клик** через менеджер (KernelSU-Next, WildKSU и т.д.)
- 🖱 **Ручной выбор версии ядра** через WebUI
- ✅ Поддержка большинства устройств с GKI2

---

## 📦 Установка

1. **Скачайте модуль** самоновейшая версия находится [тут](https://github.com/CMiSSioN/GKI_patcher_curl_ui/releases/latest)  
2. **Установите его** через менеджер (KernelSU-Next, WildKSU и т.д.)
3. **Перезагрузите устройство**  

---

## 🚀 Использование

Перед использованием убедитесь, что вы используете самоновейшую версию модуля
<details>
<summary>Текущую версию модуля можно узнать так</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/version.png"/>
</details>

Использование возможно в двух режимах
1. Через кнопку action в менеджере
2. Через WebUI

## Использование через кнопку action
<details>
<summary>скриншот с положением кнопки</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/action.png"/>
</details>
<details>
<summary>При первом запуске action будет предложен выбор из нескольких репозитариев</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/action_kernel_repo.png"/>
</details>
Репозитарии переключаются циклично нажатием кнопки VOL- <br/>
Если устройство будет определено как OnePlus со специальным ядром, тогда по умолчанию будет выбран репозитарий WildKernels(OnePlus-WKSU) <br/>
Во всех остальных случаях по умолчанию будет выбран KernelSU-Next(GKI-KSUN) <br/>
Для того чтобы выбрать репозиторий обратитесь к разделу "Доступные репозитории ядер" <br/>
Далее скрипт попытается произвести поиск подходящего ядра в выбранном репозитории. 
<details>
<summary>В случае успеха будет выведено название ядра предлагаемого к прошивке.</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/action_kernel_app.png"/>
</details>
В случае, если подходящее ядро найти не удалось - рекомендуется выбрать ядро вручную или переключиться на другой репозитарий используюя WebUI.

## Использование через WebUI
<details>
<summary>скриншот с положением кнопки</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/webui.png"/>
</details>
<details>
<summary>1. Выбирите репозитарий ядер</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/webui_repo_sel.png"/>
</details>
<details>
<summary>2. Выбирите ядро</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/webui_kernel_sel.png"/>
</details>
3. Нажмите кнопку "Старт"<br/>
4. После установки ядра перезагрузитесь<br/>

После выбора репозитарий ядер, модуль попытается найти в нем наиболее подходящие для вас ядро. Если у него это получится, он автоматически предложит его к установке. <br/>
Если выбрать ядро автоматически не получилось, вам необходимо будет выбрать ядро самостоятельно. Ядра с версией KMI не совпадающей с вашей текущей версией KMI (то есть совсем неподходящие для устройства) будут исключены из списка. <br/>
Если перечень доступных ядер пуст - попробуйте переключиться на другой репозиторий. <br/>

---

## Доступные репозитории ядер

1. WildKernels(OnePlus-WKSU) - в этом репозитарии находятся ядра предназначенные для ограниченного перечня устройств брендов OnePlus/Realme на которых не работают чистые GKI2-ядра. Если у вас устройство из данного перечня модуль автоматически определит это и предложит использование данного репозитария по умолчанию.
2. KernelSU-Next(KernelSU-Next) - в этом репозитарии находятся ядра предназначенные для использования с менеджером KernelSU-Next **в них нет поддержки SUSFS**
3. WildKernels(GKI-WKSU) - в этом репозитарии находятся ядра предназначенные для использования с менеджером WildKSU (поддерживаются и другие менеджеры). Следует с осторожностью подходить к выбору версии ядра для установки, новейшие версии (новее чем 13861) могут нестабильно работать на некоторых устройствах. 
4. ShirkNeko(GKI-SukiSU) - в этом репозитарии находятся ядра предназначенные для использования с менеджером SukiSU Ultra
5. MiRinFork(GKI-SukiSU) - в этом репозитарии находятся ядра предназначенные для использования с менеджером SukiSU Ultra
6. zzh20188(GKI-SukiSU) - в этом репозитарии находятся ядра предназначенные для использования с менеджером SukiSU Ultra

---

## 📄 Требования и ограничения

- Устройство с **KernelSU** совместимым менеджером (KernelSU-Next, WildKSU, SukiSU Ultra)
- Поддержка **GKI2**
- Интернет-соединение

---

## ⚠️ Важные предупреждения

- Если версия ядра выбрана **вручную** и выбрана **неправильно** — это может привести к бутлупу.  
- Пользователь обязан заранее подготовить способ восстановления устройства (например, fastboot/adb, бэкап boot.img, доступ к recovery).  
- Модуль **не запускается автоматически** — требуется ручной запуск через WebUI или кнопку действия в KernelSU Next.

---

## 🙏 Благодарности

- 💡 Оригинальная идея модуля принадлежит [gl_hf](https://4pda.to/forum/index.php?showuser=2137182) с 4PDA  

- 📦 AnyKernel3 сборки: [WildKernels/GKI_KernelSU_SUSFS](https://github.com/WildKernels/GKI_KernelSU_SUSFS/releases)

 - 💎 [KernelSu Next](https://github.com/KernelSU-Next/KernelSU-Next)
