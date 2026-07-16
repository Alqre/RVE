import {contextBridge, ipcRenderer} from 'electron';
import type {SlotWithFiles} from '../main/assets';

export interface AppApi {
  listSlots: () => Promise<SlotWithFiles[]>;
  selectFileForSlot: (slotId: string, sourcePath: string) => Promise<string>;
  openAssetsFolder: () => Promise<void>;
  startExport: (inputProps: Record<string, unknown>) => Promise<string>;
  onExportProgress: (callback: (progress: number) => void) => () => void;
}

const api: AppApi = {
  listSlots: () => ipcRenderer.invoke('slots:list'),
  selectFileForSlot: (slotId, sourcePath) => ipcRenderer.invoke('assets:selectForSlot', slotId, sourcePath),
  openAssetsFolder: () => ipcRenderer.invoke('assets:openFolder'),
  startExport: (inputProps) => ipcRenderer.invoke('export:start', inputProps),
  onExportProgress: (callback) => {
    const listener = (_event: unknown, progress: number) => callback(progress);
    ipcRenderer.on('export:progress', listener);
    return () => ipcRenderer.removeListener('export:progress', listener);
  },
};

contextBridge.exposeInMainWorld('api', api);
