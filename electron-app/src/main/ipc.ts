import fs from 'node:fs';
import {app, ipcMain, shell, BrowserWindow} from 'electron';
import {listSlots, selectFileForSlot} from './assets';
import {exportVideo, cancelExport, type ExportFormat} from './render';
import {ASSETS_DIR, OUTPUT_DIR} from './paths';

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
    // Le dossier n'existe qu'après le premier export (voir exportVideo dans render.ts) ;
    // on le crée au besoin pour que le bouton fonctionne même avant tout export.
    fs.mkdirSync(OUTPUT_DIR, {recursive: true});
    return shell.openPath(OUTPUT_DIR);
  });

  // URL fixe côté main (pas transmise depuis le renderer) : évite toute ouverture
  // d'URL arbitraire via IPC, ce bouton ne pointe que vers ce salon Discord précis.
  // Le protocole discord:// (enregistré par le client desktop à l'installation)
  // ouvre directement l'appli Discord plutôt que le lien web dans le navigateur.
  ipcMain.handle('schedule:open', () => {
    return shell.openExternal('discord://discord.com/channels/1504940388836704306/1521553835598938142');
  });

  ipcMain.handle('export:cancel', () => cancelExport());

  ipcMain.handle(
    'export:start',
    async (event, inputProps: Record<string, unknown>, format: ExportFormat, options: ExportOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      const outputPath = await exportVideo(inputProps, format, (progress) => {
        event.sender.send('export:progress', progress);
      });
      if (win && options.openFolderOnFinish) shell.showItemInFolder(outputPath);
      // On quitte après avoir renvoyé la réponse IPC (voir le délai ci-dessous) : quitter
      // avant que la promesse ne résolve empêcherait le renderer de recevoir le résultat
      // et d'afficher la confirmation d'export.
      if (options.closeAppOnFinish) {
        setTimeout(() => app.quit(), 500);
      }
      return outputPath;
    },
  );
}
