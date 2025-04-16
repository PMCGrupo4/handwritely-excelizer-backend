# Configuración Manual de Supabase Storage

Si estás teniendo problemas con la inicialización automática del bucket de almacenamiento, sigue estos pasos para configurarlo manualmente:

## 1. Crear el Bucket

1. Inicia sesión en el [Panel de Control de Supabase](https://app.supabase.io)
2. Selecciona tu proyecto
3. Ve a la sección "Storage" en el menú lateral
4. Haz clic en "Create a new bucket"
5. Nombre del bucket: `receipt-images`
6. Marca la opción "Public bucket" si quieres que los archivos sean accesibles públicamente
7. Haz clic en "Create bucket"

## 2. Configurar Políticas de Seguridad

1. En la sección "Storage", selecciona el bucket `receipt-images`
2. Ve a la pestaña "Policies"
3. Haz clic en "Add Policies"
4. Configura las siguientes políticas:

### Política para INSERT (Subir archivos)
- Policy name: `Users can upload their own images`
- Allowed operation: `INSERT`
- Policy definition: `auth.uid() = owner`
- Haz clic en "Save policy"

### Política para SELECT (Ver archivos)
- Policy name: `Anyone can view images`
- Allowed operation: `SELECT`
- Policy definition: `true`
- Haz clic en "Save policy"

### Política para DELETE (Eliminar archivos)
- Policy name: `Users can delete their own images`
- Allowed operation: `DELETE`
- Policy definition: `auth.uid() = owner`
- Haz clic en "Save policy"

## 3. Verificar la Configuración

1. Asegúrate de que el bucket `receipt-images` existe y es accesible
2. Verifica que las políticas de seguridad están configuradas correctamente
3. Reinicia tu aplicación

## Notas Adicionales

- Si estás usando autenticación anónima, es posible que necesites ajustar las políticas para permitir operaciones sin autenticación
- Para desarrollo local, puedes desactivar temporalmente las políticas de seguridad, pero asegúrate de activarlas antes de desplegar en producción 