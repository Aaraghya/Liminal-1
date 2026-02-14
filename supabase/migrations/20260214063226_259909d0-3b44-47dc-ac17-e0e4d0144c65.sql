
-- Create saved_messages table for "Unsent Texts"
CREATE TABLE public.saved_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emotions TEXT[] NOT NULL DEFAULT '{}',
  intensity INTEGER NOT NULL DEFAULT 50,
  context TEXT,
  tone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved messages"
ON public.saved_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved messages"
ON public.saved_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved messages"
ON public.saved_messages FOR DELETE USING (auth.uid() = user_id);
