/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path'
import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import openAboutWindow from 'about-window'
import MenuBuilder from './menu'

const appInfo = require('../package.json')

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

let mainWindow: BrowserWindow | null = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log)
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 520,
    height: 360,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            nodeIntegration: true,
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.NODE_ENV === 'development') {
    const menuBuilder = new MenuBuilder(mainWindow)
    menuBuilder.buildMenu()
  } else {
    Menu.setApplicationMenu(null)
  }

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', createWindow)

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// Drag-n-drop listeners
const onOpen = data => {
  console.log(data)
}
app.on('open-file', onOpen)
app.on('open-url', onOpen)

ipcMain.on('app-quit', () => {
  if (process.platform !== 'darwin') {
    app.exit()
  }
})

log.info('main1', process.cwd())
log.info('main2', __dirname)

ipcMain.on('open-about', () => {
  openAboutWindow({
    icon_path: path.join(process.cwd(), 'resources/icons/256x256.png'),
    package_json_dir: path.join(__dirname, '/../'),
    product_name: appInfo.name,
    bug_report_url: 'https://git.newtelco.dev/newtelco/billing-parser-1/issue',
    copyright: '2020 Newtelco GmbH',
    homepage: 'https://git.newtelco.dev',
    description: appInfo.description,
    license: appInfo.license,
    adjust_window_size: true,
    win_options: {
      resizable: false,
    },
    show_close_button: 'Close',
  })
})
