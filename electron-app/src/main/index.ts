import {app, BrowserWindow, Menu} from 'electron';
import path from 'node:path';
import {registerAssetProtocolScheme, handleAssetProtocol} from './protocol';
import {registerAppProtocolScheme, handleAppProtocol, APP_URL} from './appProtocol';
import {registerIpcHandlers} from './ipc';
import {initUpdater, checkForUpdates} from './updater';
import {seedAssetsIfMissing} from './assetsSeed';
import {reconcileSelectedAssets} from './assets';
import {loadInputState} from './state';

Menu.setApplicationMenu(null);

registerAssetProtocolScheme();
registerAppProtocolScheme();

const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, 'icon.png')
  : path.join(__dirname, '../../build-resources/icon.png');

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    title: 'Revival Video Exporter',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadURL(APP_URL);
  }

  return win;
}

app.whenReady().then(() => {
  seedAssetsIfMissing();
  const savedState = loadInputState();
  if (savedState) reconcileSelectedAssets(savedState.selectedSource);
  handleAssetProtocol();
  handleAppProtocol(path.join(__dirname, '../renderer'));
  registerIpcHandlers();
  const win = createWindow();

  initUpdater(win);
  if (app.isPackaged) checkForUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
