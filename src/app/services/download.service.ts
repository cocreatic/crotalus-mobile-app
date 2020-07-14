import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform, LoadingController } from '@ionic/angular';
import * as Helpers from "./../helpers";

interface DownloadResource {
  alternateName: string,
  url: string
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  downloadingAlert: any;
  fileTransfer: FileTransferObject;
  readonly SUBSTRING_NAME_LENGHT = 30;

  constructor(
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform,
    public loadingController: LoadingController,
  ) {
    this.fileTransfer = this.transfer.create();
  }

  async download(resource: DownloadResource, title: string, fileExt: string, type: string) {
    this.showDownloadingAlert();
    const url = resource.url;
    const fileNameString = title.toLowerCase().substr(0, this.SUBSTRING_NAME_LENGHT);
    const alternateName = resource.alternateName && resource.alternateName !== 'Original' ? resource.alternateName : '';
    const fileName = `${fileNameString}${alternateName ? '-' + alternateName : ''}.${fileExt}`;
    let deviceDirectoryPath = this.selectDeviceStoragePath();
    const mainFolderIsValid = await this.validateFolder(deviceDirectoryPath, 'Crotalus');
    if (!mainFolderIsValid) {
      // TODO: throw error an return
      console.log('throw error and return in crotalus folder validation');
      this.downloadingAlert.dismiss();
    }
    deviceDirectoryPath = `${deviceDirectoryPath}Crotalus/`;
    const targetType = resource.alternateName === 'Vista previa' || resource.alternateName === 'Miniatura' ? 'image' : type;
    const fileTypeFolder = `Crotalus ${Helpers.getItemTypeLabel(targetType, true)}`;
    const fileTypeFolderIsValid = await this.validateFolder(deviceDirectoryPath, fileTypeFolder);
    if (!fileTypeFolderIsValid) {
      // TODO: throw error an return
      console.log('throw error an return in filetype folder validation');
      this.downloadingAlert.dismiss();
    }

    deviceDirectoryPath = `${deviceDirectoryPath}${fileTypeFolder}/`;
    console.log('descargar de: ', url);
    const result =  await this.fileTransfer.download(url, deviceDirectoryPath + fileName);
    this.downloadingAlert.dismiss();
    return result;
  }

  async validateFolder(directoryPath: string, folder: string): Promise<boolean> {
    let folderExists = true;
    console.log(directoryPath, ' ', folder);
    try {
      await this.file.checkDir(directoryPath, folder);
    } catch (error) {
      try {
        await this.file.createDir(directoryPath, folder, false);
      } catch (error) {
        folderExists = false;
      }
    }
    return folderExists;
  }

  selectDeviceStoragePath(): string {
    return this.platform.is('ios') ? this.file.dataDirectory : this.file.externalRootDirectory;
  }

  async showDownloadingAlert() {
    this.downloadingAlert = await this.loadingController.create({
      message: 'Descargando...',
      duration: 0
    });
    await this.downloadingAlert.present();
  }

}
