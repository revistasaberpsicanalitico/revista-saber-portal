import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xpojuyyyjnmcumcvagfr.supabase.co'
const supabaseAnonKey = 'sb_publishable_NvKssLRnCk83QFWJlDzm-A_38Vb5aXr'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
