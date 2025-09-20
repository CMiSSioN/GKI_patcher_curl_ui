# 🧩 KernelSU GKI2 Patcher

**KernelSU GKI2 Auto-Patcher** — это модуль для **KernelSU Next**, который упрощает установку AnyKernel3 на устройства с GKI2-ядрами.  
Он определяет версию ядра, скачивает подходящую сборку **AnyKernel3** из [WildKernels/GKI_KernelSU_SUSFS](https://github.com/WildKernels/GKI_KernelSU_SUSFS/releases) и устанавливает её одним нажатием.

---

## 🔧 Возможности

- 🔍 **Автоматическое определение версии ядра** (GKI2)
- 📥 **Загрузка нужного AnyKernel3** с GitHub
- ⚡ **Установка в один клик** через KernelSU Next
- 🖱 **Ручной выбор версии ядра** через WebUI (если автоопределение не сработало)
- ✅ Поддержка большинства устройств с GKI2

---

## 🚀 Установка и запуск

1. **Скачайте модуль** с [страницы релизов](https://github.com/ТВОЙ_НИК/ТВОЙ_РЕПОЗИТОРИЙ/releases)  
2. **Установите его** через KernelSU Next  
3. **Перезагрузите устройство**  
4. **Запустите модуль**:
   - Через **WebUI** — нажмите кнопку `Установить`
   - Или через **KernelSU Next** — нажмите кнопку действия рядом с модулем  
5. Дождитесь завершения — результат установки появится в логах

---

## 📸 Скриншоты

>  ![Screenshot_2025-09-20-22-08-59-312_pmdmqs pqgrlv xizasj](https://github.com/user-attachments/assets/c5edb925-4541-436e-bbc4-863d26a54ca5)
![Screenshot_2025-09-20-22-33-28-781_pmdmqs pqgrlv xizasj](https://github.com/user-attachments/assets/8a9fd6e3-4c03-44a4-8554-9a3c7137659f)


---

## 📄 Требования и ограничения

- Устройство с **KernelSU Next**
- Поддержка **GKI2**
- Интернет-соединение
- ❌ **Не поддерживаются устройства**: Oppo, Vivo, OnePlus, Realme  
- ✅ **Перед использованием убедитесь**, что ваше устройство совместимо с ядрами из [репозитория WildKernels](https://github.com/WildKernels/GKI_KernelSU_SUSFS/releases)

---

## ⚠️ Важные предупреждения

- Если версия ядра выбрана **вручную** и выбрана **неправильно** — это может привести к бутлупу.  
- Пользователь обязан заранее подготовить способ восстановления устройства (например, fastboot/adb, бэкап boot.img, доступ к recovery).  
- Модуль **не запускается автоматически** — требуется ручной запуск через WebUI или кнопку действия в KernelSU Next.

---

## 🛠 Источник

- AnyKernel3 релизы: [WildKernels/GKI_KernelSU_SUSFS](https://github.com/WildKernels/GKI_KernelSU_SUSFS/releases)

 - [KernelSu Next](https://github.com/KernelSU-Next/KernelSU-Next)
