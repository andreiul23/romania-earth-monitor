-- Create volunteer announcements table
CREATE TABLE public.volunteer_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id TEXT NOT NULL,
  region_name TEXT NOT NULL,
  hazard_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.volunteer_announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
ON public.volunteer_announcements
FOR SELECT
USING (is_active = true);

-- Authenticated users with admin/analyst role can create announcements
CREATE POLICY "Admins and analysts can create announcements"
ON public.volunteer_announcements
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'analyst')
);

-- Admins and analysts can update their announcements
CREATE POLICY "Admins and analysts can update announcements"
ON public.volunteer_announcements
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'analyst')
);

-- Admins can delete announcements
CREATE POLICY "Admins can delete announcements"
ON public.volunteer_announcements
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));