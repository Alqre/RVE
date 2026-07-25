import fs from 'node:fs';
import {app, ipcMain, shell, BrowserWindow} from 'electron';
import {listSlots, selectFileForSlot} from './assets';
import {exportVideo, cancelExport, type ExportFormat} from './render';
import {ASSETS_DIR, OUTPUT_DIR} from './paths';
import {loadInputState, saveInputState, type SavedInputState} from './state';
import {installUpdate} from './updater';

export interface ExportOptions {
  openFolderOnFinish: boolean;
  closeAppOnFinish: boolean;
}

export function registerIpcHandlers(): void {
  ipcMain.handle('slots:list', () => listSlots());

  ipcMain.handle('assets:selectForSlot', (_event, slotId: string, sourcePath: string) => {
    return selectFileForSlot(slotId, sourcePath);
  });

  ipcMain.handle('assets:openFolder', () => shell.openPath(ASSETS_DIR));

  ipcMain.handle('exports:openFolder', () => {
    fs.mkdirSync(OUTPUT_DIR, {recursive: true});
    return shell.openPath(OUTPUT_DIR);
  });

  ipcMain.handle('schedule:open', () => {
    return shell.openExternal('discord://discord.com/channels/1504940388836704306/1521553835598938142');
  });

  ipcMain.handle('export:cancel', () => cancelExport());

  ipcMain.handle('state:load', () => loadInputState());

  ipcMain.handle('state:save', (_event, state: SavedInputState) => saveInputState(state));

  ipcMain.handle('updater:install', () => installUpdate());

  ipcMain.handle(
    'export:start',
    async (event, inputProps: Record<string, unknown>, format: ExportFormat, options: ExportOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      const outputPath = await exportVideo(inputProps, format, (progress) => {
        event.sender.send('export:progress', progress);
      });
      if (win && options.openFolderOnFinish) shell.showItemInFolder(outputPath);
      if (options.closeAppOnFinish) {
        setTimeout(() => app.quit(), 500);
      }
      return outputPath;
    },
  );
}
