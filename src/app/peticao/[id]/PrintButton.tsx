'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Imprimir
    </button>
  )
}
