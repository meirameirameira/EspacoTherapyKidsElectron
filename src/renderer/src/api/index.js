// Todas as chamadas vão via IPC para o processo principal (Electron main)
// que executa as operações no SQLite local e sincroniza com o Supabase.

export const fetchPacientes      = (params)     => window.api.fetchPacientes(params)
export const fetchPacienteById   = (id)         => window.api.fetchPacienteById(id)
export const createPaciente      = (data)       => window.api.createPaciente(data)
export const updatePaciente      = (id, data)   => window.api.updatePaciente(id, data)
export const deletePaciente      = (id)         => window.api.deletePaciente(id)
export const exportPacientesXlsx = ()           => window.api.exportPacientesXlsx()

// Sem autenticação no app desktop
export function logout() {}
