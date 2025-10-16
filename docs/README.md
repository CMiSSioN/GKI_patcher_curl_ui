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

### Использование через кнопку action
<details>
<summary>скриншот с положением кнопки</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/action.png"/>
</details>
<details>
<summary>При первом запуске action будет предложен выбор из нескольких репозитариев</summary>
<IMG src="https://raw.githubusercontent.com/CMiSSioN/GKI_patcher_curl_ui/refs/heads/master/docs/images/action_kernel_repo.png"/>
</details>
Репозитарии переключаются циклично нажатием кнопки VOL-. Устройство будет определено как OnePlus со специальным ядром, тогда по умолчанию будет выбран репозитарий WildKernels(OnePlus-WKSU). Во всех остальных случаях по умолчанию будет выбран KernelSU-Next(GKI-KSUN)

---

## 📄 Требования и ограничения

- Устройство с **KernelSU Next**
- Поддержка **GKI2**
- Интернет-соединение
- ✅ **Перед использованием убедитесь**, что ваше устройство совместимо с ядрами из [репозитория WildKernels](https://github.com/WildKernels/GKI_KernelSU_SUSFS/releases)

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
