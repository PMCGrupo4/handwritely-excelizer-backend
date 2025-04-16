-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('receipt-images', 'receipt-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Política para INSERT (Subir archivos)
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'receipt-images'
  AND (storage."extension"(name) = 'jpg' OR storage."extension"(name) = 'png')
  AND auth.uid() = owner
);

-- Política para SELECT (Ver archivos)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT USING (
  bucket_id = 'receipt-images'
  AND (storage."extension"(name) = 'jpg' OR storage."extension"(name) = 'png')
  AND true
);

-- Política para DELETE (Eliminar archivos)
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE USING (
  bucket_id = 'receipt-images'
  AND auth.uid() = owner
);

-- Política para UPDATE (Actualizar archivos)
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'receipt-images'
  AND auth.uid() = owner
);

-- Política para permitir acceso anónimo (solo para desarrollo)
CREATE POLICY "Allow anonymous access"
ON storage.objects FOR ALL USING (
  bucket_id = 'receipt-images'
  AND auth.role() = 'anon'
); 