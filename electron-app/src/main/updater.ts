import {autoUpdater} from 'electron-updater';
import type {BrowserWindow} from 'electron';

export type UpdaterStatus = {state: 'available'; version: string} | {state: 'not-available'} | {state: 'error'; message: string};

autoUpdater.autoDownload = false;

export function initUpdater(win: BrowserWindow): void {
  const send = (status: UpdaterStatus) => win.webContents.send('updater:status', status);

  autoUpdater.on('update-available', (info) => send({state: 'available', version: info.version}));
  autoUpdater.on('update-not-available', () => send({state: 'not-available'}));
  autoUpdater.on('error', (err) => send({state: 'error', message: err.message}));
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch(() => {});
}
