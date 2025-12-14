# 🚀 Guía de Inicio – Automatización con n8n

Este documento describe los pasos necesarios para **iniciar y configurar la automatización en n8n**, incluyendo credenciales, workflows y exposición del servicio mediante **ngrok**.

---

## 🧩 Requisitos previos

Antes de comenzar, asegúrate de tener:

* Docker y Docker Compose instalados
* Acceso al panel web de **n8n**
* Archivo del workflow de n8n en formato `.json`
* `ngrok.exe` descargado e instalado

---

## 🔐 1. Configuración de la cuenta inicial (Owner Account)

Al iniciar n8n por primera vez, se debe crear la cuenta administradora:

* **Email:** `agrotechsena2025@gmail.com`
* **First Name:** Agrotech
* **Last Name:** Sena
* **Password:** `Agrotech2025`

  * Mínimo 8 caracteres
  * Al menos 1 mayúscula
  * Al menos 1 número

---

## 🤖 2. Configuración de credenciales

### 📲 Credenciales Telegram API

En **Credentials → Create New**, agregar una credencial de tipo **Telegram API** con los siguientes datos:

* **Token:**

  ```
  8146315904:AAHIglCgbwd70X8ltf9W8BmsRG9-5Z28EB4
  ```

---

### 🐘 Credenciales PostgreSQL

Crear una credencial de tipo **PostgreSQL** con la siguiente información:

* **Host:** `host.docker.internal`
* **Database:** `agrotech`
* **User:** `agrotech`
* **Password:** `123`
* **Port:** `5432`
* **Maximum Number of Connections:** `100`
* **SSL:** Disable

---

## 🔄 3. Importar el workflow

1. Ir a la sección **Workflows**
2. Seleccionar **Import from File**
3. Elegir el archivo `.json` del workflow de n8n

---

## 🔧 4. Asignar credenciales a los nodos

Dentro del workflow importado:

* Seleccionar **cada nodo de Telegram y PostgreSQL**
* Presionar **Enter** sobre el campo de credenciales
* Elegir la credencial correspondiente creada anteriormente

⚠️ Este paso es obligatorio para que el workflow funcione correctamente.

---

## 🌐 5. Configuración de ngrok (Webhooks)

Para exponer n8n a internet (necesario para webhooks como Telegram):

1. Iniciar sesión en ngrok:

   ```bash
   ngrok config add-authtoken TU_TOKEN_DE_NGROK
   ```

2. Activar el puerto de n8n:

   ```bash
   ngrok http 5678
   ```

3. Copiar la URL HTTPS generada por ngrok

---

## 🖥️ 6. Acceso a n8n

Una vez todo esté en ejecución, acceder a n8n desde el navegador:

```
http://localhost:5678
```

---

## ✅ Notas finales

* Verifica que Docker y los contenedores estén activos
* Asegúrate de que ngrok esté corriendo mientras se usan webhooks
* No olvides **guardar y activar el workflow** en n8n

---

📌 *Documento de referencia para la puesta en marcha de la automatización Agrotech – SENA*
