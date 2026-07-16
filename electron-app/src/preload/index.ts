import {contextBridge, ipcRenderer} from 'electron';
import type {SlotWithFiles} from '../main/assets';
import type {ExportFormat} from '../main/render';

export interface AppApi {
  listSlots: () => Promise<SlotWithFiles[]>;
  selectFileForSlot: (slotId: string, sourcePath: string) => Promise<string>;
  openAssetsFolder: () => Promise<void>;
  startExport: (inputProps: Record<string, unknown>, format: ExportFormat) => Promise<string>;
  onExportProgress: (callback: (progress: number) => void) => () => void;
}

const api: AppApi = {
  listSlots: () => ipcRenderer.invoke('slots:list'),
  selectFileForSlot: (slotId, sourcePath) => ipcRenderer.invoke('assets:selectForSlot', slotId, sourcePath),
  openAssetsFolder: () => ipcRenderer.invoke('assets:openFolder'),
  startExport: (inputProps, format) => ipcRenderer.invoke('export:start', inputProps, format),
  onExportProgress: (callback) => {
    const listener = (_event: unknown, progress: number) => callback(progress);
    ipcRenderer.on('export:progress', listener);
    return () => ipcRenderer.removeListener('export:progress', listener);
  },
};

contextBridge.exposeInMainWorld('api', api);
