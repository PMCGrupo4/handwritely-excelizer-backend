# Handwritely Excelizer Backend

Backend para la aplicación Handwritely Excelizer, que convierte recibos escritos a mano en hojas de cálculo Excel utilizando OCR.

## Características

- Autenticación de usuarios con Supabase
- Procesamiento de imágenes con OCR usando Tesseract.js
- Almacenamiento de imágenes en Supabase Storage
- API RESTful para gestionar comandos
- Conversión de datos a formato Excel

## Tecnologías

- Node.js
- Express
- TypeScript
- Supabase (Autenticación y Almacenamiento)
- Tesseract.js (OCR)
- XLSX.js (Generación de Excel)

## Requisitos Previos

- Node.js (v14 o superior)
- npm
- Cuenta en Supabase

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/tu-usuario/handwritely-excelizer-backend.git
   cd handwritely-excelizer-backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Crear archivo `.env` basado en `.env.example`:
   ```
   PORT=3000
   SUPABASE_URL=tu-url-de-supabase
   SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
   SUPABASE_SERVICE_KEY=tu-clave-de-servicio-de-supabase
   ```

4. Configurar Supabase:
   - Crear un nuevo proyecto en Supabase
   - Habilitar autenticación con Google y Facebook
   - Ejecutar el script SQL en `supabase/storage.sql` para configurar el almacenamiento
   - Crear la tabla `commands` con la siguiente estructura:
     ```sql
     create table commands (
       id uuid default uuid_generate_v4() primary key,
       user_id uuid references auth.users(id) on delete cascade,
       image_url text,
       items jsonb,
       total numeric,
       status text,
       created_at timestamp with time zone default now()
     );
     
     -- Políticas de seguridad
     alter table commands enable row level security;
     
     create policy "Users can view their own commands"
       on commands for select
       using (auth.uid() = user_id);
     
     create policy "Users can insert their own commands"
       on commands for insert
       with check (auth.uid() = user_id);
     
     create policy "Users can delete their own commands"
       on commands for delete
       using (auth.uid() = user_id);
     ```

5. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

## Estructura del Proyecto

```
handwritely-excelizer-backend/
├── src/
│   ├── config/           # Configuración de Supabase y otros servicios
│   ├── controllers/      # Controladores de la API
│   ├── middleware/       # Middleware de Express
│   ├── routes/           # Rutas de la API
│   ├── services/         # Servicios de negocio
│   └── index.ts          # Punto de entrada de la aplicación
├── supabase/             # Scripts SQL para Supabase
├── .env.example          # Ejemplo de variables de entorno
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración de TypeScript
```

## API Endpoints

### Comandos

- `GET /api/commands` - Obtener todos los comandos del usuario
- `POST /api/commands` - Crear un nuevo comando (requiere imagen)
- `DELETE /api/commands/:id` - Eliminar un comando

## Almacenamiento

El backend utiliza Supabase Storage para almacenar las imágenes de los recibos. Las imágenes se almacenan en un bucket llamado `receipt-images` con las siguientes características:

- Límite de tamaño de archivo: 5MB
- Formatos permitidos: JPG, JPEG, PNG
- Políticas de seguridad:
  - Los usuarios solo pueden subir sus propias imágenes
  - Los usuarios solo pueden ver sus propias imágenes
  - Los usuarios solo pueden eliminar sus propias imágenes

## Despliegue

1. Construir la aplicación:
   ```
   npm run build
   ```

2. Iniciar en producción:
   ```
   npm start
   ```

## Licencia

MIT 

# HandSheet Backend

Backend para la aplicación HandSheet - Convertidor de escritura a Excel.

## Configuración para Netlify

### Requisitos previos

1. Cuenta en Netlify
2. Cuenta en Google Cloud con la API de Vision habilitada
3. Credenciales de Google Cloud en formato JSON

### Pasos para el despliegue

1. **Preparar las credenciales de Google Cloud**
   - Descarga tus credenciales de Google Cloud en formato JSON
   - Convierte el archivo JSON a una cadena de texto (puedes usar herramientas online o comandos como `cat credentials.json | jq -c`)
   - Guarda esta cadena para usarla como variable de entorno

2. **Configurar variables de entorno en Netlify**
   - Ve a la configuración de tu sitio en Netlify
   - En la sección "Build & deploy" > "Environment variables", agrega:
     - `GOOGLE_CLOUD_CREDENTIALS`: La cadena JSON de tus credenciales de Google Cloud
     - `SUPABASE_URL`: Tu URL de Supabase
     - `SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
     - `CORS_ORIGIN`: URL de tu frontend (ej: `https://handsheetmain.netlify.app`)

3. **Desplegar el backend**
   - Conecta tu repositorio a Netlify
   - Configura el comando de build: `npm install && npm run build:functions`
   - Configura el directorio de publicación: `public`
   - Configura el directorio de funciones: `functions`

4. **Verificar el despliegue**
   - Una vez desplegado, verifica que la función de salud esté funcionando:
     - Visita: `https://tu-backend.netlify.app/.netlify/functions/health`
   - Verifica que la función de OCR esté funcionando:
     - Visita: `https://tu-backend.netlify.app/.netlify/functions/ocr`

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura del proyecto

```
handwritely-excelizer-backend/
├── src/
│   ├── functions/       # Funciones de Netlify
│   ├── services/        # Servicios (Google Vision, etc.)
│   ├── controllers/     # Controladores
│   ├── routes/          # Rutas
│   ├── middleware/      # Middleware
│   └── config/          # Configuración
├── public/              # Archivos estáticos
├── functions/           # Funciones compiladas
├── .env                 # Variables de entorno
├── netlify.toml         # Configuración de Netlify
└── package.json         # Dependencias y scripts
```

## API Endpoints

### OCR

- **URL**: `/api/commands/ocr`
- **Método**: `POST`
- **Descripción**: Procesa una imagen y extrae texto usando Google Vision API
- **Formato**: `multipart/form-data`
- **Parámetros**:
  - `image`: Archivo de imagen (JPEG, PNG)
- **Respuesta**:
  ```json
  {
    "success": true,
    "data": {
      "rawText": "Texto extraído de la imagen",
      "receipt": {
        "items": [
          {
            "name": "Producto",
            "quantity": 1,
            "price": 1000,
            "subtotal": 1000
          }
        ]
      }
    }
  }
  ```

### Health Check

- **URL**: `/health`
- **Método**: `GET`
- **Descripción**: Verifica que el backend esté funcionando
- **Respuesta**:
  ```json
  {
    "status": "ok",
    "timestamp": "2023-04-15T12:00:00Z"
  }
  ``` 