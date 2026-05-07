#!/bin/bash

# ==============================================================================
# CanchaYa - Script de configuración de EAS (Expo Application Services)
# ==============================================================================
# Este script te guiará paso a paso para configurar EAS Build y EAS Update
# en tu proyecto de CanchaYa.
#
# Uso: chmod +x scripts/setup-eas.sh && ./scripts/setup-eas.sh
# ==============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Variables
GITHUB_REPO="https://github.com/bateristaterranova-cmd/canchaya-app"
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║       🏟️  CanchaYa - Setup EAS Config          ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ──────────────────────────────────────────────
# PASO 0: Verificar prerrequisitos
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}📋 Paso 0: Verificando prerrequisitos...${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Instálalo desde https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) instalado${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version) instalado${NC}"

# Verificar git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado. Instálalo desde https://git-scm.com${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git $(git --version) instalado${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "$MOBILE_DIR/app.json" ]; then
    echo -e "${RED}❌ No se encontró app.json. Asegúrate de ejecutar este script desde el directorio mobile/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Directorio del proyecto verificado: $MOBILE_DIR${NC}"

echo ""

# ──────────────────────────────────────────────
# PASO 1: Instalar EAS CLI
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}📦 Paso 1: Instalando EAS CLI globalmente...${NC}"
echo ""

if command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚡ EAS CLI ya está instalado: $(eas --version)${NC}"
    read -p "¿Quieres actualizarlo? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npm install -g eas-cli@latest
        echo -e "${GREEN}✅ EAS CLI actualizado a la última versión${NC}"
    fi
else
    npm install -g eas-cli@latest
    echo -e "${GREEN}✅ EAS CLI instalado correctamente${NC}"
fi

echo ""

# ──────────────────────────────────────────────
# PASO 2: Iniciar sesión en Expo
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}🔐 Paso 2: Iniciar sesión en Expo...${NC}"
echo ""
echo -e "${YELLOW}Si no tienes una cuenta de Expo, créala en: https://expo.dev/signup${NC}"
echo ""

# Verificar si ya está logueado
CURRENT_USER=$(eas whoami 2>/dev/null || echo "")
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "" ]; then
    echo -e "${GREEN}✅ Ya estás logueado como: $CURRENT_USER${NC}"
    read -p "¿Quieres usar esta cuenta? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        eas logout
        eas login
    fi
else
    eas login
fi

# Verificar login exitoso
LOGGED_USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$LOGGED_USER" ]; then
    echo -e "${RED}❌ No se pudo iniciar sesión en Expo. Intenta de nuevo.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Sesión iniciada como: $LOGGED_USER${NC}"

echo ""

# ──────────────────────────────────────────────
# PASO 3: Inicializar proyecto EAS
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}🚀 Paso 3: Inicializando proyecto en EAS...${NC}"
echo ""

cd "$MOBILE_DIR"

# Verificar si el proyecto ya está configurado
PROJECT_ID=$(node -e "
  try {
    const config = require('./app.json');
    console.log(config.expo.extra?.eas?.projectId || '');
  } catch(e) {
    console.log('');
  }
")

if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "PLACEHOLDER_RUN_EAS_INIT" ]; then
    echo -e "${GREEN}✅ Proyecto EAS ya configurado con ID: $PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚡ Ejecutando eas init para crear el proyecto...${NC}"
    eas init --id
    echo -e "${GREEN}✅ Proyecto EAS inicializado${NC}"
    
    # Obtener el nuevo project ID
    PROJECT_ID=$(node -e "
      try {
        const config = require('./app.json');
        console.log(config.expo.extra?.eas?.projectId || '');
      } catch(e) {
        console.log('');
      }
    ")
    echo -e "${GREEN}📋 Project ID: $PROJECT_ID${NC}"
fi

echo ""

# ──────────────────────────────────────────────
# PASO 4: Configurar EAS Build
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}🔨 Paso 4: Configurando EAS Build...${NC}"
echo ""

if [ -f "$MOBILE_DIR/eas.json" ]; then
    echo -e "${GREEN}✅ eas.json ya existe con perfiles configurados${NC}"
    echo -e "${CYAN}   Perfiles disponibles: development, preview, production${NC}"
else
    echo -e "${YELLOW}⚡ Ejecutando eas build:configure...${NC}"
    eas build:configure
    echo -e "${GREEN}✅ EAS Build configurado${NC}"
fi

echo ""

# ──────────────────────────────────────────────
# PASO 5: Crear EXPO_TOKEN
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}🔑 Paso 5: Crear token de acceso (EXPO_TOKEN)...${NC}"
echo ""
echo -e "${YELLOW}Para que GitHub Actions funcione, necesitas crear un token de acceso${NC}"
echo -e "${YELLOW}y agregarlo como secreto en tu repositorio de GitHub.${NC}"
echo ""
echo -e "${CYAN}Instrucciones:${NC}"
echo -e "  1. Ve a https://expo.dev/settings/access-tokens"
echo -e "  2. Haz clic en 'Create Token'"
echo -e "  3. Dale un nombre (ej: 'canchaya-github-actions')"
echo -e "  4. Copia el token generado"
echo ""

read -p "¿Ya tienes tu EXPO_TOKEN? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    read -sp "Pega tu EXPO_TOKEN: " EXPO_TOKEN
    echo ""
    
    if [ -n "$EXPO_TOKEN" ]; then
        echo -e "${GREEN}✅ Token recibido${NC}"
        echo ""
        echo -e "${CYAN}Ahora vamos a agregar el secreto a GitHub...${NC}"
        
        # Verificar si gh CLI está instalado
        if command -v gh &> /dev/null; then
            echo -e "${YELLOW}⚡ gh CLI detectado. Agregando secreto automáticamente...${NC}"
            
            # Verificar autenticación de gh
            if gh auth status &> /dev/null; then
                gh secret set EXPO_TOKEN --repo bateristaterranova-cmd/canchaya-app --body "$EXPO_TOKEN"
                echo -e "${GREEN}✅ EXPO_TOKEN agregado como secreto en GitHub${NC}"
            else
                echo -e "${YELLOW}⚠️  gh CLI no está autenticado. Agrega el secreto manualmente:${NC}"
                echo -e "   Ve a: https://github.com/bateristaterranova-cmd/canchaya-app/settings/secrets/actions"
                echo -e "   Nombre: EXPO_TOKEN"
                echo -e "   Valor: [tu token]"
            fi
        else
            echo -e "${YELLOW}⚠️  gh CLI no está instalado. Agrega el secreto manualmente:${NC}"
            echo -e "   Ve a: https://github.com/bateristaterranova-cmd/canchaya-app/settings/secrets/actions"
            echo -e "   Nombre: EXPO_TOKEN"
            echo -e "   Valor: [tu token]"
        fi
    else
        echo -e "${RED}❌ Token vacío. Debes agregar EXPO_TOKEN manualmente más tarde.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Debes agregar EXPO_TOKEN manualmente más tarde:${NC}"
    echo -e "   1. Crea el token en: https://expo.dev/settings/access-tokens"
    echo -e "   2. Agrégalo en: https://github.com/bateristaterranova-cmd/canchaya-app/settings/secrets/actions"
fi

echo ""

# ──────────────────────────────────────────────
# PASO 6: Configurar Git y subir a GitHub
# ──────────────────────────────────────────────
echo -e "${BOLD}${BLUE}📤 Paso 6: Subir configuración a GitHub...${NC}"
echo ""

cd "$MOBILE_DIR"

# Verificar si es un repositorio git
if [ ! -d "$MOBILE_DIR/.git" ]; then
    # Verificar si el directorio padre es un repo git
    if git -C "$MOBILE_DIR" rev-parse --is-inside-work-tree &> /dev/null; then
        echo -e "${GREEN}✅ El proyecto está dentro de un repositorio Git${NC}"
    else
        echo -e "${YELLOW}⚡ Inicializando repositorio Git...${NC}"
        git init
        git remote add origin "$GITHUB_REPO"
        echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"
    fi
else
    echo -e "${GREEN}✅ Repositorio Git detectado${NC}"
fi

# Verificar remote
CURRENT_REMOTE=$(git -C "$MOBILE_DIR" remote get-url origin 2>/dev/null || echo "")
if [ -z "$CURRENT_REMOTE" ]; then
    git -C "$MOBILE_DIR" remote add origin "$GITHUB_REPO"
    echo -e "${GREEN}✅ Remote 'origin' agregado: $GITHUB_REPO${NC}"
elif [ "$CURRENT_REMOTE" != "$GITHUB_REPO" ]; then
    echo -e "${YELLOW}⚠️  Remote actual: $CURRENT_REMOTE${NC}"
    read -p "¿Quieres actualizarlo a $GITHUB_REPO? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git -C "$MOBILE_DIR" remote set-url origin "$GITHUB_REPO"
        echo -e "${GREEN}✅ Remote actualizado${NC}"
    fi
fi

# Stage y commit
echo ""
echo -e "${YELLOW}⚡ Agregando archivos de configuración EAS...${NC}"
git -C "$MOBILE_DIR" add eas.json app.json .github/workflows/ scripts/ docs/
git -C "$MOBILE_DIR" status

echo ""
read -p "¿Quieres hacer commit y push? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    git -C "$MOBILE_DIR" commit -m "feat: configurar EAS Build, EAS Update y GitHub Actions"
    git -C "$MOBILE_DIR" push origin main 2>/dev/null || git -C "$MOBILE_DIR" push -u origin main
    echo -e "${GREEN}✅ Cambios subidos a GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  No se subieron los cambios. Haz commit y push manualmente.${NC}"
fi

echo ""

# ──────────────────────────────────────────────
# RESUMEN FINAL
# ──────────────────────────────────────────────
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║       ✅ ¡Configuración completada!             ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}📋 Resumen de lo configurado:${NC}"
echo ""
echo -e "  ${GREEN}✅${NC} EAS CLI instalado"
echo -e "  ${GREEN}✅${NC} Sesión de Expo: ${BOLD}$LOGGED_USER${NC}"
echo -e "  ${GREEN}✅${NC} Project ID: ${BOLD}$PROJECT_ID${NC}"
echo -e "  ${GREEN}✅${NC} eas.json con 3 perfiles: development, preview, production"
echo -e "  ${GREEN}✅${NC} GitHub Actions: eas-update.yml (OTA automático)"
echo -e "  ${GREEN}✅${NC} GitHub Actions: eas-build.yml (Builds automáticos)"
echo -e "  ${GREEN}✅${NC} app.json configurado con plugins y permisos"
echo ""
echo -e "${BOLD}🔑 Pendiente:${NC}"
echo ""
echo -e "  ${YELLOW}⚡${NC} Verificar que EXPO_TOKEN esté en GitHub Secrets"
echo -e "      → https://github.com/bateristaterranova-cmd/canchaya-app/settings/secrets/actions"
echo ""
echo -e "${BOLD}📱 Comandos útiles:${NC}"
echo ""
echo -e "  ${CYAN}eas build --platform android --profile development${NC}  # Build de desarrollo"
echo -e "  ${CYAN}eas build --platform android --profile preview${NC}      # Build de preview (APK)"
echo -e "  ${CYAN}eas build --platform android --profile production${NC}   # Build de producción (AAB)"
echo -e "  ${CYAN}eas update --platform android --channel preview${NC}     # Actualización OTA"
echo -e "  ${CYAN}eas update --platform android --channel production${NC}  # Actualización OTA producción"
echo ""
echo -e "${BOLD}📚 Para más información, consulta:${NC}"
echo -e "  ${CYAN}mobile/docs/SETUP.md${NC}"
echo ""
