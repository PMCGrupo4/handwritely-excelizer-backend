-- Enable the storage extension
create extension if not exists "storage" schema extensions;

-- Create a function to create storage policies
create or replace function create_storage_policy(
  bucket_name text,
  policy_name text,
  policy_definition text,
  policy_operation text
) returns void as $$
begin
  -- Check if policy exists
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = policy_name
  ) then
    -- Create policy
    execute format(
      'create policy %I on storage.objects for %s to authenticated using (%s)',
      policy_name,
      policy_operation,
      policy_definition
    );
  end if;
end;
$$ language plpgsql security definer;

-- Create policies for receipt-images bucket
select create_storage_policy(
  'receipt-images',
  'Users can upload their own images',
  '(auth.uid() = owner)',
  'INSERT'
);

select create_storage_policy(
  'receipt-images',
  'Users can view their own images',
  '(auth.uid() = owner)',
  'SELECT'
);

select create_storage_policy(
  'receipt-images',
  'Users can delete their own images',
  '(auth.uid() = owner)',
  'DELETE'
);

-- Grant necessary permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant execute on function create_storage_policy to authenticated; 