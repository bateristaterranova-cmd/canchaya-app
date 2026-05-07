# 🏟️ CanchaYa - Guía de Configuración EAS + GitHub Actions

> Guía completa para configurar Expo Application Services (EAS) y GitHub Actions
> para builds automáticos y actualizaciones OTA (Over-The-Air).

---

## 📋 Índice

1. [Requisitos Previos](#-requisitos-previos)
2. [Crear Cuenta de Expo](#-paso-1-crear-cuenta-de-expo)
3. [Instalar EAS CLI](#-paso-2-instalar-eas-cli)
4. [Inicializar Proyecto EAS](#-paso-3-inicializar-proyecto-eas)
5. [Configurar EXPO_TOKEN en GitHub](#-paso-4-configurar-expo_token-en-github)
6. [Cómo Funciona la Automatización](#-cómo-funciona-la-automatización)
7. [Actualizar OTA desde la Terminal](#-actualizar-ota-desde-la-terminal)
8. [Construir la App](#-construir-la-app)
9. [Probar en tu Teléfono](#-probar-en-tu-teléfono)
10. [Solución de Problemas](#-solución-de-problemas)
11. [Comandos de Referencia Rápida](#-comandos-de-referencia-rápida)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener:

| Requisito | Versión Mínima | Verificación |
|-----------|---------------|-------------|
| Node.js | 18+ | `node --version` |
| npm | 8+ | `npm --version` |
| Git | 2.30+ | `git --version` |
| Cuenta de Expo | Gratuita | [expo.dev/signup](https://expo.dev/signup) |
| Cuenta de GitHub | Gratuita | [github.com/signup](https://github.com/signup) |
| Repositorio GitHub | — | `canchaya-app` ya creado |

---

## 🔑 Paso 1: Crear Cuenta de Expo

1. Ve a [https://expo.dev/signup](https://expo.dev/signup)
2. Regístrate con tu email o cuenta de GitHub
3. Verifica tu email si es necesario
4. Una vez registrado, verás tu dashboard en [https://expo.dev](https://expo.dev)

> 💡 **Tip**: Si usas la cuenta gratuita de EAS, tienes **30 builds/mes** para Android
> y **actualizaciones OTA ilimitadas**.

---

## 🔧 Paso 2: Instalar EAS CLI

EAS CLI es la herramienta de línea de comandos para interactuar con Expo Application Services.

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli@latest

# Verificar la instalación
eas --version
```

Deberías ver algo como:
```
eas-cli/15.x.x darwin-arm64 node-v20.x.x
```

---

## 🚀 Paso 3: Inicializar Proyecto EAS

### Opción A: Script automático (Recomendado)

```bash
# Desde el directorio mobile/
cd mobile
chmod +x scripts/setup-eas.sh
./scripts/setup-eas.sh
```

Este script te guiará por todos los pasos automáticamente.

### Opción B: Configuración manual

#### 3.1 Iniciar sesión en Expo

```bash
eas login
```

Ingresa tu usuario y contraseña de Expo. Verifica:

```bash
eas whoami
# Debería mostrar tu nombre de usuario
```

#### 3.2 Inicializar el proyecto

```bash
# Desde el directorio mobile/
cd mobile
eas init --id
```

Este comando:
- Crea el proyecto en Expo.dev
- Agrega `extra.eas.projectId` a tu `app.json`
- Configura `updates.url` automáticamente

> ⚠️ **Importante**: Si `app.json` ya tiene un `projectId` placeholder
> (`PLACEHOLDER_RUN_EAS_INIT`), EAS lo reemplazará automáticamente.

#### 3.3 Verificar la configuración

Después de `eas init`, tu `app.json` debería verse así:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "abc123-def456-..."  // ← ID real de tu proyecto
      }
    },
    "updates": {
      "url": "https://u.expo.dev/abc123-def456-..."  // ← URL real
    }
  }
}
```

Verifica que el `projectId` ya no sea `PLACEHOLDER_RUN_EAS_INIT`.

---

## 🔐 Paso 4: Configurar EXPO_TOKEN en GitHub

El `EXPO_TOKEN` es un token de acceso personal que permite a GitHub Actions
autenticarse con Expo para ejecutar builds y publicar actualizaciones OTA.

### 4.1 Crear el token en Expo

1. Ve a [https://expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Haz clic en **"Create Token"**
3. Configura:
   - **Nombre**: `canchaya-github-actions`
   - **Descripción**: `Token para GitHub Actions de CanchaYa`
   - **Permisos**: Read and Write (necesario para builds y updates)
4. Haz clic en **"Create"**
5. **⚠️ COPIA EL TOKEN AHORA** — No se volverá a mostrar

### 4.2 Agregar el token como secreto en GitHub

1. Ve a tu repositorio: [https://github.com/bateristaterranova-cmd/canchaya-app](https://github.com/bateristaterranova-cmd/canchaya-app)
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **"New repository secret"**
4. Configura:
   - **Name**: `EXPO_TOKEN`
   - **Value**: Pega el token que copiaste en el paso 4.1
5. Haz clic en **"Add secret"**

### 4.3 Verificar (opcional con gh CLI)

Si tienes [GitHub CLI](https://cli.github.com/) instalado:

```bash
gh auth login
gh secret set EXPO_TOKEN --repo bateristaterranova-cmd/canchaya-app
# Pega tu token y presiona Enter
```

---

## ⚙️ Cómo Funciona la Automatización

### Pipeline de Automatización

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Push a main │────▶│  GitHub Actions  │────▶│   Expo EAS      │
│  (mobile/)   │     │  se ejecuta      │     │   ejecuta build │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                      │                         │
       │                      │                         │
       ▼                      ▼                         ▼
  Cambios en           Detecta qué             Build APK/AAB
  archivos mobile/     cambió y ejecuta        o Update OTA
                       la acción correcta
```

### EAS Update (OTA) — Actualizaciones Automáticas

**Archivo**: `.github/workflows/eas-update.yml`

| Propiedad | Valor |
|-----------|-------|
| **Trigger** | Push a `main` cuando cambian archivos en `mobile/` |
| **Qué hace** | Publica actualización OTA para Android |
| **Canales** | `preview` y `production` |
| **Qué actualiza** | Solo código JavaScript (no cambios nativos) |

**Flujo:**
1. Haces push de cambios a `main` (ej: nueva funcionalidad, fix de UI)
2. GitHub Actions detecta cambios en `mobile/`
3. Instala dependencias y EAS CLI
4. Ejecuta `eas update --platform android --channel preview`
5. Ejecuta `eas update --platform android --channel production`
6. Los usuarios con la app instalada reciben la actualización automáticamente

> 💡 **Las actualizaciones OTA solo funcionan para cambios en JavaScript/HTML/CSS.**
> Si cambias código nativo (plugins, permisos, configuración Android/iOS),
> necesitas un nuevo build.

### EAS Build — Builds Automáticos

**Archivo**: `.github/workflows/eas-build.yml`

| Propiedad | Valor |
|-----------|-------|
| **Trigger automático** | Push a `main` cuando cambia `mobile/app.json` (versión) |
| **Trigger manual** | Workflow dispatch con selección de perfil y plataforma |
| **Perfil por defecto** | `preview` (genera APK) |

**Perfiles disponibles:**

| Perfil | Tipo de Build | Output | Uso |
|--------|--------------|--------|-----|
| `development` | Debug APK | `.apk` | Pruebas en dispositivo durante desarrollo |
| `preview` | Release APK | `.apk` | Pruebas de integración, QA, demos |
| `production` | Release AAB | `.aab` | Publicación en Google Play Store |

**Flujo automático (versión cambia):**
1. Actualizas `version` en `app.json` (ej: `"1.0.0"` → `"1.1.0"`)
2. Haces push a `main`
3. GitHub Actions detecta el cambio en `app.json`
4. Ejecuta `eas build --platform android --profile preview`
5. Genera un APK que puedes descargar e instalar

**Flujo manual:**
1. Ve a [Actions](https://github.com/bateristaterranova-cmd/canchaya-app/actions)
2. Selecciona **"EAS Build"**
3. Haz clic en **"Run workflow"**
4. Selecciona perfil (`development`, `preview`, `production`)
5. Selecciona plataforma (`android`, `all`)
6. Haz clic en **"Run workflow"**

---

## 🔄 Actualizar OTA desde la Terminal

Si necesitas publicar una actualización OTA sin esperar a GitHub Actions:

```bash
# Desde el directorio mobile/
cd mobile

# Actualizar canal preview
eas update --platform android --channel preview

# Actualizar canal production
eas update --platform android --channel production

# Actualizar con mensaje descriptivo
eas update --platform android --channel preview --message "Fix: corregir bug en pantalla de reserva"

# Actualizar ambos canales
eas update --platform android --channel preview --message "Nueva funcionalidad X"
eas update --platform android --channel production --message "Nueva funcionalidad X"
```

### Canales de Actualización

Los canales te permiten enviar actualizaciones a diferentes grupos de usuarios:

| Canal | Uso | Quién lo recibe |
|-------|-----|----------------|
| `development` | Pruebas internas | Desarrolladores |
| `preview` | QA y demos | Equipo de pruebas |
| `production` | Usuarios finales | Todos los usuarios |

---

## 🔨 Construir la App

### Desde la Terminal

```bash
# Desde el directorio mobile/
cd mobile

# Build de desarrollo (APK debug, incluye herramientas de dev)
eas build --platform android --profile development

# Build de preview (APK release, listo para pruebas)
eas build --platform android --profile preview

# Build de producción (AAB, para Google Play Store)
eas build --platform android --profile production
```

### Monitorear Builds

```bash
# Ver lista de builds
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]

# Ver builds en ejecución
eas build:list --status running
```

### Descargar el APK/AAB

Después de que un build se complete:

1. **Desde la terminal**:
   ```bash
   eas build:list
   # Busca el build y haz clic en el enlace de descarga
   ```

2. **Desde Expo.dev**:
   - Ve a [https://expo.dev](https://expo.dev)
   - Selecciona tu proyecto
   - Ve a **Builds** → encuentra tu build → **Download**

3. **Desde GitHub Actions**:
   - Ve a [Actions](https://github.com/bateristaterranova-cmd/canchaya-app/actions)
   - Selecciona el workflow run
   - Busca el enlace al build en los logs

---

## 📱 Probar en tu Teléfono

### Método 1: Expo Go (Desarrollo Rápido)

Para desarrollo diario, usa Expo Go — no necesitas compilar la app:

1. **Instala Expo Go en tu teléfono**:
   - Android: Busca "Expo Go" en Google Play Store
   - También puedes descargarlo desde [expo.dev/go](https://expo.dev/go)

2. **Inicia el servidor de desarrollo**:
   ```bash
   cd mobile
   npx expo start
   ```

3. **Escanea el código QR**:
   - Abre Expo Go en tu teléfono
   - Escanea el código QR que aparece en la terminal
   - La app se cargará en tu teléfono

> 💡 **Ventajas de Expo Go**: Recarga instantánea (hot reload), no necesitas
> compilar, puedes probar cambios en segundos.
>
> ⚠️ **Limitaciones**: Algunos plugins nativos personalizados no funcionan
> en Expo Go. Para esos, usa EAS Build.

### Método 2: EAS Build (APK de Desarrollo)

Para probar la app completa con todos los plugins nativos:

1. **Construye un APK de desarrollo**:
   ```bash
   eas build --platform android --profile development
   ```

2. **Descarga el APK** desde Expo.dev o el enlace en la terminal

3. **Instala en tu teléfono**:
   - Transfiere el APK a tu teléfono
   - Abre el archivo APK y permite instalación desde orígenes desconocidos
   - La app se instalará como cualquier otra aplicación

4. **Para actualizar**, usa EAS Update:
   ```bash
   eas update --platform android --channel development
   ```
   La app descargará la actualización al abrirla.

### Método 3: EAS Update (Producción)

Para usuarios que ya tienen la app instalada:

1. La app verifica automáticamente si hay actualizaciones al abrirla
2. Si hay una actualización OTA disponible, se descarga en segundo plano
3. La próxima vez que el usuario abra la app, verá la nueva versión

> 💡 **Para que EAS Update funcione**, los usuarios deben tener un build
> instalado que tenga el mismo `runtimeVersion`. Cambios en código nativo
> requieren un nuevo build (cambia el runtimeVersion).

---

## 🐛 Solución de Problemas

### Error: "EXPO_TOKEN is not set"

**Problema**: GitHub Actions no puede autenticarse con Expo.

**Solución**:
1. Verifica que agregaste `EXPO_TOKEN` en GitHub Secrets
2. Ve a: `https://github.com/bateristaterranova-cmd/canchaya-app/settings/secrets/actions`
3. Asegúrate de que el nombre sea exactamente `EXPO_TOKEN` (mayúsculas)
4. Verifica que el token no haya expirado en [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)

### Error: "Project not found"

**Problema**: EAS no reconoce el proyecto.

**Solución**:
1. Verifica que `app.json` tenga un `projectId` válido:
   ```bash
   cat app.json | grep projectId
   ```
2. Si dice `PLACEHOLDER_RUN_EAS_INIT`, ejecuta:
   ```bash
   eas init --id
   ```
3. Si el proyecto se eliminó en Expo.dev, crea uno nuevo:
   ```bash
   eas init
   ```

### Error: "Build failed"

**Problema**: El build en EAS falla.

**Solución**:
1. Revisa los logs del build:
   ```bash
   eas build:view [BUILD_ID]
   ```
2. Errores comunes:
   - **Dependencias faltantes**: Ejecuta `npm install` localmente
   - **Versión de SDK incompatible**: Verifica que `expo` en `package.json`
     sea compatible con EAS
   - **Configuración de Android**: Verifica `app.json` → `android` section

### Las actualizaciones OTA no llegan

**Problema**: Los usuarios no reciben la actualización.

**Solución**:
1. Verifica que la app tenga el canal correcto configurado
2. Verifica que el `runtimeVersion` sea el mismo:
   ```json
   "runtimeVersion": { "policy": "appVersion" }
   ```
   Si la versión de la app cambió (ej: 1.0.0 → 1.1.0), necesitas un nuevo build
3. Las actualizaciones se verifican al abrir la app — pide al usuario que
   cierre y reabra la app
4. Verifica que el canal en `eas update` coincida con el canal del build

### Error: "eas: command not found"

**Problema**: EAS CLI no está instalado.

**Solución**:
```bash
npm install -g eas-cli@latest
```

Si usas nvm, asegúrate de estar usando la versión correcta de Node:
```bash
nvm use 20
npm install -g eas-cli@latest
```

### GitHub Actions no se ejecuta

**Problema**: Los workflows no se disparan.

**Solución**:
1. Verifica que los archivos estén en la ruta correcta:
   - `.github/workflows/eas-update.yml`
   - `.github/workflows/eas-build.yml`
2. Para `eas-update.yml`: verifica que estés haciendo push a `main` y que
   haya cambios en archivos dentro de `mobile/`
3. Para `eas-build.yml`: verifica que `mobile/app.json` haya cambiado,
   o usa trigger manual desde la interfaz de GitHub Actions
4. Verifica los logs en:
   `https://github.com/bateristaterranova-cmd/canchaya-app/actions`

---

## 📚 Comandos de Referencia Rápida

### EAS CLI

```bash
# Autenticación
eas login                    # Iniciar sesión
eas logout                   # Cerrar sesión
eas whoami                   # Ver usuario actual

# Proyecto
eas init                     # Inicializar proyecto
eas init --id                # Inicializar con proyecto existente

# Builds
eas build --platform android --profile development   # APK de desarrollo
eas build --platform android --profile preview       # APK de preview
eas build --platform android --profile production    # AAB de producción
eas build:list               # Listar builds
eas build:view [ID]          # Ver detalles de build
eas build:cancel             # Cancelar build en curso

# Actualizaciones OTA
eas update --platform android --channel preview      # Publicar a preview
eas update --platform android --channel production   # Publicar a producción
eas update:list              # Listar actualizaciones

# Configuración
eas build:configure          # Configurar eas.json
eas update:configure         # Configurar actualizaciones
```

### Estructura de Archivos

```
mobile/
├── .github/
│   └── workflows/
│       ├── eas-update.yml     # OTA automático al push a main
│       └── eas-build.yml      # Build automático al cambiar versión
├── app.json                   # Configuración de Expo (con EAS projectId)
├── eas.json                   # Perfiles de build (dev, preview, prod)
├── scripts/
│   └── setup-eas.sh           # Script de configuración automática
├── docs/
│   └── SETUP.md               # Esta guía
├── assets/
│   ├── icon.png               # Ícono de la app (1024x1024)
│   ├── adaptive-icon.png      # Ícono adaptivo Android
│   ├── splash-icon.png        # Pantalla de splash
│   └── favicon.png            # Favicon para web
└── ...
```

### Variables de Entorno

| Variable | Dónde se usa | Propósito |
|----------|-------------|-----------|
| `EXPO_TOKEN` | GitHub Secrets | Autenticación de GitHub Actions con Expo |
| `EXPO_PUBLIC_ENV` | eas.json (por perfil) | Entorno actual: development/preview/production |

---

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo Diario

```bash
# 1. Inicia el servidor de desarrollo
cd mobile
npx expo start

# 2. Prueba en Expo Go en tu teléfono
# (escanea el código QR)

# 3. Haz cambios en el código
# (la app se recarga automáticamente)

# 4. Cuando termines, haz commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# → GitHub Actions publicará actualización OTA automáticamente
```

### Para Releases (Nueva Versión)

```bash
# 1. Actualiza la versión en app.json
# Cambia "version": "1.0.0" → "1.1.0"

# 2. Haz commit y push
git add app.json
git commit -m "chore: bump version to 1.1.0"
git push origin main
# → GitHub Actions ejecutará build automáticamente

# 3. También puedes ejecutar manualmente:
eas build --platform android --profile production

# 4. Sube el AAB a Google Play Console
```

### Para Hotfixes Urgentes

```bash
# 1. Haz el fix en el código
# 2. Commit y push
git add .
git commit -m "fix: corregir bug crítico"
git push origin main
# → Actualización OTA automática a preview y production

# 3. Si el fix requiere cambios nativos:
eas build --platform android --profile production
# → Descarga el nuevo build y publícalo
```

---

## 📞 Soporte

- **Documentación oficial de EAS**: [docs.expo.dev/eas](https://docs.expo.dev/eas/)
- **Foro de Expo**: [forums.expo.dev](https://forums.expo.dev/)
- **GitHub Issues**: [github.com/bateristaterranova-cmd/canchaya-app/issues](https://github.com/bateristaterranova-cmd/canchaya-app/issues)

---

*Última actualización: Marzo 2026*
