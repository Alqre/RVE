import {ipcMain, shell, BrowserWindow} from 'electron';
import {listSlots, selectFileForSlot} from './assets';
import {exportVideo} from './render';
import {ASSETS_DIR} from './paths';

export function registerIpcHandlers(): void {
  ipcMain.handle('slots:list', () => listSlots());

  ipcMain.handle('assets:selectForSlot', (_event, slotId: string, sourcePath: string) => {
    return selectFileForSlot(slotId, sourcePath);
  });

  ipcMain.handle('assets:openFolder', () => shell.openPath(ASSETS_DIR));

  ipcMain.handle('export:start', async (event, inputProps: Record<string, unknown>) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const outputPath = await exportVideo(inputProps, (progress) => {
      event.sender.send('export:progress', progress);
    });
    if (win) shell.showItemInFolder(outputPath);
    return outputPath;
  });
}
