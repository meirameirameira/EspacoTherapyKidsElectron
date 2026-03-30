import { contextBridge, ipcRenderer } from 'electron'

// Expõe as funções de banco de dados para o React via window.api
contextBridge.exposeInMainWorld('api', {
  fetchPacientes:     (params)     => ipcRenderer.invoke('pacientes:list', params),
  fetchPacienteById:  (id)         => ipcRenderer.invoke('pacientes:getById', id),
  createPaciente:     (data)       => ipcRenderer.invoke('pacientes:create', data),
  updatePaciente:     (id, data)   => ipcRenderer.invoke('pacientes:update', id, data),
  deletePaciente:     (id)         => ipcRenderer.invoke('pacientes:delete', id),
  exportPacientesXlsx: ()          => ipcRenderer.invoke('pacientes:export'),
})
