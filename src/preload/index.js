import { contextBridge, ipcRenderer } from 'electron'

// Expõe as funções de banco de dados para o React via window.api
contextBridge.exposeInMainWorld('api', {
  fetchPacientes:     (params)     => ipcRenderer.invoke('pacientes:list', params),
  fetchPacienteById:  (id)         => ipcRenderer.invoke('pacientes:getById', id),
  createPaciente:     (data)       => ipcRenderer.invoke('pacientes:create', data),
  updatePaciente:     (id, data)   => ipcRenderer.invoke('pacientes:update', id, data),
  deletePaciente:     (id)         => ipcRenderer.invoke('pacientes:delete', id),
  exportPacientesXlsx: ()          => ipcRenderer.invoke('pacientes:export'),
  fetchAgenda:          ()           => ipcRenderer.invoke('agenda:list'),
  createAgendaSlot:     (data)      => ipcRenderer.invoke('agenda:create', data),
  updateAgendaSlot:     (id, data)  => ipcRenderer.invoke('agenda:update', id, data),
  deleteAgendaSlot:     (id)        => ipcRenderer.invoke('agenda:delete', id),
  fetchProfissionais:   ()           => ipcRenderer.invoke('profissionais:list'),
  createProfissional:   (data)      => ipcRenderer.invoke('profissionais:create', data),
  updateProfissional:   (id, data)  => ipcRenderer.invoke('profissionais:update', id, data),
  deleteProfissional:   (id)        => ipcRenderer.invoke('profissionais:delete', id),
  windowMinimize:  () => ipcRenderer.invoke('window:minimize'),
  windowMaximize:  () => ipcRenderer.invoke('window:maximize'),
  windowClose:     () => ipcRenderer.invoke('window:close'),
})
