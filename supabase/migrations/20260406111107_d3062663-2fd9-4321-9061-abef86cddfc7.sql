
-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT '',
  storage_path TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read folders, files, comments
CREATE POLICY "Anyone can view folders" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Anyone can view files" ON public.files FOR SELECT USING (true);
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);

-- Anyone can insert/update/delete (app uses client-side auth)
CREATE POLICY "Anyone can create folders" ON public.folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update folders" ON public.folders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete folders" ON public.folders FOR DELETE USING (true);

CREATE POLICY "Anyone can create files" ON public.files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete files" ON public.files FOR DELETE USING (true);

CREATE POLICY "Anyone can create comments" ON public.comments FOR INSERT WITH CHECK (true);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', true);

CREATE POLICY "Anyone can view task files" ON storage.objects FOR SELECT USING (bucket_id = 'task-files');
CREATE POLICY "Anyone can upload task files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-files');
CREATE POLICY "Anyone can delete task files" ON storage.objects FOR DELETE USING (bucket_id = 'task-files');
