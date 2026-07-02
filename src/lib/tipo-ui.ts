// Mapeamentos visuais por tipoCaso — únicos dados que ficam no código (são decisões de UI, não de negócio)

export const TIPO_COLORS: Record<string, string> = {
  trabalhista:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  previdenciario: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  consumidor:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  civel:          'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  outros:         'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

export const TIPO_CARD_COLOR: Record<string, string> = {
  trabalhista:    'indigo',
  previdenciario: 'emerald',
  consumidor:     'amber',
  civel:          'blue',
  outros:         'slate',
}

export const CARD_COR_MAP: Record<string, { pill: string; icon: string }> = {
  indigo:  { pill: 'bg-indigo-50 text-indigo-700 border-indigo-100',  icon: 'bg-indigo-100' },
  emerald: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'bg-emerald-100' },
  amber:   { pill: 'bg-amber-50 text-amber-700 border-amber-100',    icon: 'bg-amber-100' },
  blue:    { pill: 'bg-blue-50 text-blue-700 border-blue-100',       icon: 'bg-blue-100' },
  slate:   { pill: 'bg-slate-50 text-slate-700 border-slate-100',    icon: 'bg-slate-100' },
}
