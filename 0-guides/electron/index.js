npm create @quick-start/electron@latest

import { app, BrowserWindow } from 'electron'
import { join } from 'path'

let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,

    minWidth: 1100,
    minHeight: 700,

    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',

    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } 
  else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
