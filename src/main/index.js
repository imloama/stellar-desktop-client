import { app, BrowserWindow,ipcMain, Tray,Menu  } from 'electron'
const path = require('path');
const nativeImage = require('electron').nativeImage
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
let tray ;

function createWindow () {
  if (process.platform === 'darwin') {
    const template = [
      {
        label: "Application",
        submenu: [
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]
      }, 
      {
        label: "Edit",
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
  
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
    show: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    // mainWindow.maximize()
    start = new Date().getTime()
  })
  mainWindow.on('blur', ()=>{
    //记录时间
    start = new Date().getTime()
  })
  mainWindow.on('focus', ()=>{
    //判断是否要显示锁屏界面
    let end = new Date().getTime()
    let gap = end - start
    if(gap> 60000){//10分钟 60000
      mainWindow.webContents.send('lock', 'needlock')
    }
  })

  createTray();

  update();
}

function createTray(){
 // tray = new Tray('./icon.png');//系统托盘图标
  // tray = new Tray(path.join(__dirname, '../build/icons/icon.png'))
  let image = nativeImage.createFromPath(path.join(__static, 'tray.png'))
  tray = new Tray(image);
    const contextMenu = Menu.buildFromTemplate([ // 菜单项
      {label: 'Show', type: 'radio', click: () => {mainWindow.show()}},
      {label: 'Hide', type: 'radio', click: () => {mainWindow.hide()}},
      {label: 'Exit', type: 'normal', click: () => {app.quit()}},
    ])
    tray.setToolTip('value network in hand') // 鼠标放上时候的提示
    tray.setContextMenu(contextMenu) // 应用菜单项
}

function update(){
  require('update-electron-app')({
    repo: 'imloama/stellar-desktop-client',
    updateInterval: '1 hour',
    logger: require('electron-log')
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
