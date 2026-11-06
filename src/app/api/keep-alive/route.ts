import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Consulta leve e rápida para manter o banco Supabase acordado
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase mantido ativo com sucesso pela Revista Saber Psicanalítico!',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
