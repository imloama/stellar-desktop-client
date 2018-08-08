import { app, BrowserWindow,ipcMain  } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let start ;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 768,
    useContentSize: true,
    width: 1024,
    fullscreen: false,
    fullscreenable: true,
    backgroundColor: '#212122',
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    start = new Date().getTime()
  })
  mainWindow.on('blur', ()=>{
    //记录时间
    start = new Date().getTime()
    console.log('------------blur------------------' + start)
  })
  mainWindow.on('focus', ()=>{
    //判断是否要显示锁屏界面
    let end = new Date().getTime()
    let gap = end - start
    console.log('----------focus---------' + end + '--' + gap)
    if(gap> 60000){//10分钟 60000
      mainWindow.webContents.send('lock', 'needlock')
    }
  })


}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
//退出
ipcMain.on('window-all-closed', () => {
  app.quit();
});
//小化
ipcMain.on('hide-window', () => {
  mainWindow.minimize();
});
//最大化
ipcMain.on('show-window', () => {
  mainWindow.maximize();
});
//还原
ipcMain.on('orignal-window', () => {
  mainWindow.unmaximize();
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
