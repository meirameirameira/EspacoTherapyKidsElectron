import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import db from './db'

const iconPath = app.isPackaged
  ? join(process.resourcesPath, 'icon.ico')
  : join(__dirname, '../../src/renderer/src/assets/logo-cereb.ico')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    title: 'Espaço Therapy Kids',
  })

  ipcMain.handle('window:minimize',  () => mainWindow.minimize())
  ipcMain.handle('window:maximize',  () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.handle('window:close',     () => mainWindow.close())

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('pacientes:list', (_, params) => db.listPacientes(params))
  ipcMain.handle('pacientes:getById', (_, id) => db.getPacienteById(id))
  ipcMain.handle('pacientes:create', (_, data) => db.createPaciente(data))
  ipcMain.handle('pacientes:update', (_, id, data) => db.updatePaciente(id, data))
  ipcMain.handle('pacientes:delete', (_, id) => db.deletePaciente(id))

  ipcMain.handle('agenda:list',   ()              => db.listAgenda())
  ipcMain.handle('agenda:create', (_, data)       => db.createAgendaSlot(data))
  ipcMain.handle('agenda:update', (_, id, data)   => db.updateAgendaSlot(id, data))
  ipcMain.handle('agenda:delete', (_, id)         => db.deleteAgendaSlot(id))

  ipcMain.handle('profissionais:list',   ()           => db.listProfissionais())
  ipcMain.handle('profissionais:create', (_, data)    => db.createProfissional(data))
  ipcMain.handle('profissionais:update', (_, id, data) => db.updateProfissional(id, data))
  ipcMain.handle('profissionais:delete', (_, id)      => db.deleteProfissional(id))

  ipcMain.handle('pacientes:export', async () => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: 'pacientes.xlsx',
      filters: [{ name: 'Planilha Excel', extensions: ['xlsx'] }],
    })
    if (canceled || !filePath) return { cancelled: true }
    await db.exportToXlsx(filePath)
    return { success: true }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
