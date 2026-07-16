import {app, BrowserWindow} from 'electron';
import path from 'node:path';
import {registerAssetProtocolScheme, handleAssetProtocol} from './protocol';
import {registerAppProtocolScheme, handleAppProtocol, APP_URL} from './appProtocol';
import {registerIpcHandlers} from './ipc';

registerAssetProtocolScheme();
registerAppProtocolScheme();

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    title: 'Stream Scene Export',
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
}

app.whenReady().then(() => {
  handleAssetProtocol();
  handleAppProtocol(path.join(__dirname, '../renderer'));
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
