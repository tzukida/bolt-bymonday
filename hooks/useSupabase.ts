import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export const useSupabase = () => {
  return useMemo(() => supabase, []);
};