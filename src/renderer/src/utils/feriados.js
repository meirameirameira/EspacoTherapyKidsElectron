/**
 * Calcula os feriados para um determinado ano.
 * Inclui feriados nacionais (fixos + móveis), estaduais de SP e municipais de Cotia-SP.
 */

// Algoritmo de Meeus/Jones/Butcher para calcular a data da Páscoa
function calcularPascoa(ano) {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1 // 0-indexed
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(ano, mes, dia)
}

function somarDias(data, dias) {
  const d = new Date(data)
  d.setDate(d.getDate() + dias)
  return d
}

/**
 * Retorna um Map de "YYYY-M-D" → [{ nome, tipo }]
 * tipo: 'nacional' | 'estadual' | 'municipal'
 */
export function getFeriados(ano) {
  const pascoa = calcularPascoa(ano)
  const lista = []

  // ── Nacionais fixos ─────────────────────────────────────────────────────────
  lista.push({ data: new Date(ano, 0,  1),  nome: 'Ano Novo',                      tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 3,  21), nome: 'Tiradentes',                    tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 4,  1),  nome: 'Dia do Trabalho',               tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 8,  7),  nome: 'Independência do Brasil',       tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 9,  12), nome: 'N. Sra. Aparecida',             tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 10, 2),  nome: 'Finados',                       tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 10, 15), nome: 'Proclamação da República',      tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 10, 20), nome: 'Consciência Negra',             tipo: 'nacional'   })
  lista.push({ data: new Date(ano, 11, 25), nome: 'Natal',                         tipo: 'nacional'   })

  // ── Nacionais móveis ────────────────────────────────────────────────────────
  lista.push({ data: somarDias(pascoa, -48), nome: 'Carnaval',                     tipo: 'nacional'   })
  lista.push({ data: somarDias(pascoa, -47), nome: 'Carnaval',                     tipo: 'nacional'   })
  lista.push({ data: somarDias(pascoa,  -2), nome: 'Sexta-feira Santa',            tipo: 'nacional'   })
  lista.push({ data: pascoa,                 nome: 'Páscoa',                        tipo: 'nacional'   })
  lista.push({ data: somarDias(pascoa,  60), nome: 'Corpus Christi',               tipo: 'nacional'   })

  // ── Estadual — São Paulo ────────────────────────────────────────────────────
  lista.push({ data: new Date(ano, 6,  9),  nome: 'Revolução Constitucionalista',  tipo: 'estadual'   })

  // ── Municipais — Cotia / SP ─────────────────────────────────────────────────
  // Lei municipal: aniversário de Cotia — 28 de janeiro (elevação a município em 1856)
  lista.push({ data: new Date(ano, 0,  28), nome: 'Aniversário de Cotia',          tipo: 'municipal'  })
  // Festa da Padroeira — N. Sra. do Monte Serrat — 27 de abril
  lista.push({ data: new Date(ano, 3,  27), nome: 'N. Sra. do Monte Serrat',       tipo: 'municipal'  })

  // Converte para mapa indexado por "ano-mes-dia" (mes 0-indexed)
  const mapa = new Map()
  for (const f of lista) {
    const chave = `${f.data.getFullYear()}-${f.data.getMonth()}-${f.data.getDate()}`
    if (!mapa.has(chave)) mapa.set(chave, [])
    mapa.get(chave).push({ nome: f.nome, tipo: f.tipo })
  }
  return mapa
}

export function chaveData(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
