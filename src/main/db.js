import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import ExcelJS from 'exceljs'

// Banco local SQLite — fica em C:\Users\<usuario>\AppData\Roaming\espaco-therapy-kids\
const DB_PATH = join(app.getPath('userData'), 'espaco-therapy.db')
const db = new Database(DB_PATH)

// Cria as tabelas se ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS tb_paciente (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nr_responsavel   TEXT,
    nm_responsavel   TEXT NOT NULL,
    nm_paciente      TEXT NOT NULL,
    preco_fono       REAL    DEFAULT 0,
    horas_fono       INTEGER DEFAULT 0,
    reembolso_fono   REAL    DEFAULT 0,
    preco_to         REAL    DEFAULT 0,
    horas_to         INTEGER DEFAULT 0,
    reembolso_to     REAL    DEFAULT 0,
    preco_aba        REAL    DEFAULT 0,
    reembolso_aba    REAL    DEFAULT 0,
    sincronizado     INTEGER DEFAULT 0,
    supabase_id      TEXT
  );

  CREATE TABLE IF NOT EXISTS deletados (
    supabase_id  TEXT PRIMARY KEY,
    deletado_em  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tb_agenda (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id     INTEGER NOT NULL,
    dia_semana      TEXT NOT NULL,
    horario         TEXT NOT NULL,
    tipo_terapia    TEXT NOT NULL,
    profissional_id INTEGER,
    FOREIGN KEY(paciente_id)     REFERENCES tb_paciente(id)     ON DELETE CASCADE,
    FOREIGN KEY(profissional_id) REFERENCES tb_profissional(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS tb_profissional (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT NOT NULL,
    especialidade TEXT NOT NULL
  );
`)

// Migrações para bancos já existentes (ADD COLUMN ignora se já existir)
for (const sql of [
  'ALTER TABLE tb_paciente ADD COLUMN endereco TEXT',
  'ALTER TABLE tb_agenda   ADD COLUMN profissional_id INTEGER',
]) {
  try { db.exec(sql) } catch (_) {}
}

// ─── Supabase (opcional) ──────────────────────────────────────────────────────
// Configura via arquivo .env com MAIN_VITE_SUPABASE_URL e MAIN_VITE_SUPABASE_ANON_KEY
let supabase = null
const supabaseUrl = import.meta.env.MAIN_VITE_SUPABASE_URL
const supabaseKey = import.meta.env.MAIN_VITE_SUPABASE_ANON_KEY

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
  setTimeout(syncToSupabase, 3000)          // sync inicial após 3s
  setInterval(syncToSupabase, 5 * 60 * 1000) // sync a cada 5 minutos
}

// ─── Mapeamento SQLite ↔ formato usado pelo React ────────────────────────────

function rowToDto(row) {
  return {
    codigo: row.id,
    nome: row.nm_paciente,
    endereco: row.endereco ?? null,
    nrResponsavel: row.nr_responsavel,
    nmResponsavel: row.nm_responsavel,
    fono: {
      preco: row.preco_fono ?? 0,
      horas: row.horas_fono ?? 0,
      reembolsoInformado: row.reembolso_fono ?? null,
    },
    terapiaOcupacional: {
      preco: row.preco_to ?? 0,
      horas: row.horas_to ?? 0,
      reembolsoInformado: row.reembolso_to ?? null,
    },
    aba: {
      preco: row.preco_aba ?? 0,
      horas: 1,
      reembolsoInformado: row.reembolso_aba ?? null,
    },
  }
}

function dtoToColumns(dto) {
  const toNum = (v) => (v === '' || v === null || v === undefined ? null : Number(v))
  return {
    nr_responsavel: String(dto.nrResponsavel ?? ''),
    nm_responsavel: dto.nmResponsavel ?? '',
    nm_paciente:    dto.nome ?? '',
    endereco:       dto.endereco ?? null,
    preco_fono:     dto.fono?.preco ?? 0,
    horas_fono:     dto.fono?.horas ?? 0,
    reembolso_fono: toNum(dto.fono?.reembolsoInformado),
    preco_to:       dto.terapiaOcupacional?.preco ?? 0,
    horas_to:       dto.terapiaOcupacional?.horas ?? 0,
    reembolso_to:   toNum(dto.terapiaOcupacional?.reembolsoInformado),
    preco_aba:      dto.aba?.preco ?? 0,
    reembolso_aba:  toNum(dto.aba?.reembolsoInformado),
  }
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

function listPacientes({ nome, nmResponsavel } = {}) {
  let query = 'SELECT * FROM tb_paciente WHERE 1=1'
  const params = []

  if (nome) {
    query += ' AND nm_paciente LIKE ?'
    params.push(`%${nome}%`)
  }
  if (nmResponsavel) {
    query += ' AND nm_responsavel LIKE ?'
    params.push(`%${nmResponsavel}%`)
  }

  query += ' ORDER BY id ASC'
  return db.prepare(query).all(...params).map(rowToDto)
}

function getPacienteById(id) {
  const row = db.prepare('SELECT * FROM tb_paciente WHERE id = ?').get(Number(id))
  if (!row) throw new Error('Paciente não encontrado')
  return rowToDto(row)
}

function createPaciente(dto) {
  const cols = dtoToColumns(dto)
  const result = db.prepare(`
    INSERT INTO tb_paciente
      (nr_responsavel, nm_responsavel, nm_paciente, endereco,
       preco_fono, horas_fono, reembolso_fono,
       preco_to, horas_to, reembolso_to,
       preco_aba, reembolso_aba, sincronizado)
    VALUES
      (@nr_responsavel, @nm_responsavel, @nm_paciente, @endereco,
       @preco_fono, @horas_fono, @reembolso_fono,
       @preco_to, @horas_to, @reembolso_to,
       @preco_aba, @reembolso_aba, 0)
  `).run(cols)

  const newRow = db.prepare('SELECT * FROM tb_paciente WHERE id = ?').get(result.lastInsertRowid)
  syncToSupabase().catch(() => {})
  return rowToDto(newRow)
}

function updatePaciente(id, dto) {
  const cols = dtoToColumns(dto)
  const result = db.prepare(`
    UPDATE tb_paciente SET
      nr_responsavel = @nr_responsavel,
      nm_responsavel = @nm_responsavel,
      nm_paciente    = @nm_paciente,
      endereco       = @endereco,
      preco_fono     = @preco_fono,
      horas_fono     = @horas_fono,
      reembolso_fono = @reembolso_fono,
      preco_to       = @preco_to,
      horas_to       = @horas_to,
      reembolso_to   = @reembolso_to,
      preco_aba      = @preco_aba,
      reembolso_aba  = @reembolso_aba,
      sincronizado   = 0
    WHERE id = @id
  `).run({ ...cols, id: Number(id) })

  if (result.changes === 0) throw new Error('Paciente não encontrado')
  const updated = db.prepare('SELECT * FROM tb_paciente WHERE id = ?').get(Number(id))
  syncToSupabase().catch(() => {})
  return rowToDto(updated)
}

function deletePaciente(id) {
  const row = db.prepare('SELECT * FROM tb_paciente WHERE id = ?').get(Number(id))
  if (!row) throw new Error('Paciente não encontrado')

  // Registra deleção para o sync — usa supabase_id se existir, senão usa o id local
  // (registros puxados do Supabase chegam com supabase_id = null, mas seu local_id no Supabase = id local)
  const supabaseRef = row.supabase_id ?? String(row.id)
  db.prepare('INSERT OR IGNORE INTO deletados (supabase_id) VALUES (?)').run(supabaseRef)

  db.prepare('DELETE FROM tb_paciente WHERE id = ?').run(Number(id))
  syncToSupabase().catch(() => {})
  return { success: true }
}

// ─── Exportação Excel ─────────────────────────────────────────────────────────

async function exportToXlsx(filePath) {
  const rows = db.prepare('SELECT * FROM tb_paciente ORDER BY id ASC').all()
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Pacientes')

  sheet.columns = [
    { header: 'Código',              key: 'codigo',         width: 10 },
    { header: 'Nome Paciente',       key: 'nome',           width: 30 },
    { header: 'Nome Responsável',    key: 'nmResponsavel',  width: 30 },
    { header: 'Contato Responsável', key: 'nrResponsavel',  width: 20 },
    { header: 'FONO Valor',          key: 'preco_fono',     width: 14 },
    { header: 'FONO Horas',          key: 'horas_fono',     width: 12 },
    { header: 'FONO Total',          key: 'total_fono',     width: 14 },
    { header: 'FONO Reembolso',      key: 'reembolso_fono', width: 15 },
    { header: 'FONO NF',             key: 'nf_fono',        width: 10 },
    { header: 'TO Valor',            key: 'preco_to',       width: 14 },
    { header: 'TO Horas',            key: 'horas_to',       width: 12 },
    { header: 'TO Total',            key: 'total_to',       width: 14 },
    { header: 'TO Reembolso',        key: 'reembolso_to',   width: 15 },
    { header: 'TO NF',               key: 'nf_to',          width: 10 },
    { header: 'ABA Pacote',          key: 'preco_aba',      width: 14 },
    { header: 'ABA Reembolso',       key: 'reembolso_aba',  width: 15 },
    { header: 'ABA NF',              key: 'nf_aba',         width: 10 },
  ]

  for (const row of rows) {
    const totalFono = (row.preco_fono || 0) * (row.horas_fono || 0)
    const totalTo   = (row.preco_to   || 0) * (row.horas_to   || 0)
    const nfFono = row.reembolso_fono > 0 ? Math.ceil(totalFono / row.reembolso_fono) : 0
    const nfTo   = row.reembolso_to   > 0 ? Math.ceil(totalTo   / row.reembolso_to)   : 0
    const nfAba  = row.reembolso_aba  > 0 ? Math.ceil((row.preco_aba || 0) / row.reembolso_aba) : 0

    sheet.addRow({
      codigo:        row.id,
      nome:          row.nm_paciente,
      nmResponsavel: row.nm_responsavel,
      nrResponsavel: row.nr_responsavel,
      preco_fono:    row.preco_fono    || 0,
      horas_fono:    row.horas_fono    || 0,
      total_fono:    totalFono,
      reembolso_fono: row.reembolso_fono || 0,
      nf_fono:       nfFono,
      preco_to:      row.preco_to      || 0,
      horas_to:      row.horas_to      || 0,
      total_to:      totalTo,
      reembolso_to:  row.reembolso_to  || 0,
      nf_to:         nfTo,
      preco_aba:     row.preco_aba     || 0,
      reembolso_aba: row.reembolso_aba || 0,
      nf_aba:        nfAba,
    })
  }

  await workbook.xlsx.writeFile(filePath)
}

// ─── Sync para o Supabase ────────────────────────────────────────────────────
// Tabela no Supabase (crie pelo painel do Supabase):
//   CREATE TABLE pacientes (
//     local_id INTEGER PRIMARY KEY,
//     nr_responsavel TEXT, nm_responsavel TEXT, nm_paciente TEXT,
//     preco_fono REAL, horas_fono INT, reembolso_fono REAL,
//     preco_to REAL, horas_to INT, reembolso_to REAL,
//     preco_aba REAL, reembolso_aba REAL
//   );

async function syncToSupabase() {
  if (!supabase) return

  try {
    // ── 1. Push: envia registros locais não sincronizados ──────────────────
    const pending = db.prepare('SELECT * FROM tb_paciente WHERE sincronizado = 0').all()
    for (const row of pending) {
      const { error } = await supabase.from('pacientes').upsert(
        {
          local_id:       row.id,
          nr_responsavel: row.nr_responsavel,
          nm_responsavel: row.nm_responsavel,
          nm_paciente:    row.nm_paciente,
          preco_fono:     row.preco_fono,
          horas_fono:     row.horas_fono,
          reembolso_fono: row.reembolso_fono,
          preco_to:       row.preco_to,
          horas_to:       row.horas_to,
          reembolso_to:   row.reembolso_to,
          preco_aba:      row.preco_aba,
          reembolso_aba:  row.reembolso_aba,
        },
        { onConflict: 'local_id' }
      )
      if (!error) {
        db.prepare('UPDATE tb_paciente SET sincronizado = 1 WHERE id = ?').run(row.id)
      }
    }

    // ── 2. Push: envia deleções ────────────────────────────────────────────
    const deletados = db.prepare('SELECT * FROM deletados').all()
    for (const d of deletados) {
      const { error } = await supabase.from('pacientes').delete().eq('local_id', d.supabase_id)
      if (!error) {
        db.prepare('DELETE FROM deletados WHERE supabase_id = ?').run(d.supabase_id)
      }
    }

    // ── 3. Pull: traz do Supabase registros que não existem localmente ─────
    const { data: remoteRows, error: fetchError } = await supabase.from('pacientes').select('*')
    if (fetchError) throw fetchError

    const localIds    = new Set(db.prepare('SELECT id FROM tb_paciente').all().map(r => r.id))
    const deletadoIds = new Set(db.prepare('SELECT supabase_id FROM deletados').all().map(r => String(r.supabase_id)))

    const insertRemote = db.prepare(`
      INSERT OR IGNORE INTO tb_paciente
        (id, nr_responsavel, nm_responsavel, nm_paciente,
         preco_fono, horas_fono, reembolso_fono,
         preco_to, horas_to, reembolso_to,
         preco_aba, reembolso_aba, sincronizado)
      VALUES
        (@id, @nr_responsavel, @nm_responsavel, @nm_paciente,
         @preco_fono, @horas_fono, @reembolso_fono,
         @preco_to, @horas_to, @reembolso_to,
         @preco_aba, @reembolso_aba, 1)
    `)

    for (const remote of remoteRows) {
      if (localIds.has(remote.local_id)) continue           // já existe localmente
      if (deletadoIds.has(String(remote.local_id))) continue // foi deletado localmente

      insertRemote.run({
        id:             remote.local_id,
        nr_responsavel: remote.nr_responsavel ?? '',
        nm_responsavel: remote.nm_responsavel ?? '',
        nm_paciente:    remote.nm_paciente    ?? '',
        preco_fono:     remote.preco_fono     ?? 0,
        horas_fono:     remote.horas_fono     ?? 0,
        reembolso_fono: remote.reembolso_fono ?? 0,
        preco_to:       remote.preco_to       ?? 0,
        horas_to:       remote.horas_to       ?? 0,
        reembolso_to:   remote.reembolso_to   ?? 0,
        preco_aba:      remote.preco_aba      ?? 0,
        reembolso_aba:  remote.reembolso_aba  ?? 0,
      })
    }
  } catch (err) {
    console.error('[Supabase sync error]', err)
  }
}

// ─── Agenda ──────────────────────────────────────────────────────────────────

const DIA_ORDER = `CASE dia_semana
  WHEN 'Segunda'  THEN 1
  WHEN 'Terça'    THEN 2
  WHEN 'Quarta'   THEN 3
  WHEN 'Quinta'   THEN 4
  WHEN 'Sexta'    THEN 5
  WHEN 'Sábado'   THEN 6
  ELSE 7
END`

const AGENDA_SELECT = `
  SELECT a.id, a.paciente_id, a.dia_semana, a.horario, a.tipo_terapia,
         a.profissional_id, p.nm_paciente,
         prof.nome AS nm_profissional
  FROM tb_agenda a
  JOIN tb_paciente p ON p.id = a.paciente_id
  LEFT JOIN tb_profissional prof ON prof.id = a.profissional_id
`

function listAgenda() {
  return db.prepare(`${AGENDA_SELECT} ORDER BY ${DIA_ORDER}, a.horario ASC`).all()
}

function createAgendaSlot({ paciente_id, dia_semana, horario, tipo_terapia, profissional_id }) {
  const result = db.prepare(`
    INSERT INTO tb_agenda (paciente_id, dia_semana, horario, tipo_terapia, profissional_id)
    VALUES (@paciente_id, @dia_semana, @horario, @tipo_terapia, @profissional_id)
  `).run({
    paciente_id:     Number(paciente_id),
    dia_semana,
    horario,
    tipo_terapia,
    profissional_id: profissional_id ? Number(profissional_id) : null,
  })

  return db.prepare(`${AGENDA_SELECT} WHERE a.id = ?`).get(result.lastInsertRowid)
}

// ─── Profissionais ────────────────────────────────────────────────────────────

function listProfissionais() {
  return db.prepare('SELECT * FROM tb_profissional ORDER BY nome ASC').all()
}

function createProfissional({ nome, especialidade }) {
  const result = db.prepare(`
    INSERT INTO tb_profissional (nome, especialidade) VALUES (@nome, @especialidade)
  `).run({ nome: nome.trim(), especialidade })
  return db.prepare('SELECT * FROM tb_profissional WHERE id = ?').get(result.lastInsertRowid)
}

function deleteProfissional(id) {
  const result = db.prepare('DELETE FROM tb_profissional WHERE id = ?').run(Number(id))
  if (result.changes === 0) throw new Error('Profissional não encontrado')
  return { success: true }
}

function deleteAgendaSlot(id) {
  const result = db.prepare('DELETE FROM tb_agenda WHERE id = ?').run(Number(id))
  if (result.changes === 0) throw new Error('Horário não encontrado')
  return { success: true }
}

export default {
  listPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente, exportToXlsx,
  listAgenda, createAgendaSlot, deleteAgendaSlot,
  listProfissionais, createProfissional, deleteProfissional,
}
