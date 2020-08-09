import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform, LoadingController } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import * as Helpers from './../helpers';

interface DownloadResource {
  alternateName: string;
  url: string;
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
    private androidPermissions: AndroidPermissions,
    public loadingController: LoadingController,
  ) {
    this.fileTransfer = this.transfer.create();
  }

  async validateAndroidPermissions(): Promise<boolean> {
    try {
      const result = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      if (result.hasPermission) {
        return true;
      }
    } catch (error) {
      console.warn(error);
    }
    const permissionGranted = await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
    return permissionGranted.hasPermission;
  }

  async download(resource: DownloadResource, title: string, fileExt: string, type: string): Promise<any> {
    if (this.platform.is('android')) {
      const hasPermission = await this.validateAndroidPermissions();
      if (!hasPermission) {
        return this.returnDownloadError('error in write permission validation');
      }
    }
    this.showDownloadingAlert();
    const url = resource.url;
    const fileNameString = title.toLowerCase().substr(0, this.SUBSTRING_NAME_LENGHT);
    const alternateName = resource.alternateName && resource.alternateName !== 'Original' ? resource.alternateName : '';
    const fileName = `${fileNameString}${alternateName ? '-' + alternateName : ''}.${fileExt}`;
    let deviceDirectoryPath = this.selectDeviceStoragePath();
    const mainFolderIsValid = await this.validateFolder(deviceDirectoryPath, 'Crotalus');
    if (!mainFolderIsValid) {
      return this.returnDownloadError('error in Crotalus main folder validation');
    }
    deviceDirectoryPath = `${deviceDirectoryPath}Crotalus/`;
    const targetType = resource.alternateName === 'Vista previa' || resource.alternateName === 'Miniatura' ? 'image' : type;
    const fileTypeFolder = `Crotalus ${Helpers.getItemTypeLabel(targetType, true)}`;
    const fileTypeFolderIsValid = await this.validateFolder(deviceDirectoryPath, fileTypeFolder);
    if (!fileTypeFolderIsValid) {
      return this.returnDownloadError('error in filetype folder validation');
    }
    deviceDirectoryPath = `${deviceDirectoryPath}${fileTypeFolder}/`;
    try {
      const result = await this.fileTransfer.download(encodeURI(url), deviceDirectoryPath + fileName);
      this.downloadingAlert.dismiss();
      return result;
    } catch (error) {
      this.returnDownloadError('error downloading file: ', error);
    }
  }

  async validateFolder(directoryPath: string, folder: string): Promise<boolean> {
    let folderExists = true;
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
    return this.platform.is('ios') ? this.file.documentsDirectory : this.file.externalRootDirectory;
  }

  async showDownloadingAlert() {
    this.downloadingAlert = await this.loadingController.create({
      message: 'Descargando...',
      duration: 0
    });
    await this.downloadingAlert.present();
  }

  returnDownloadError(message: string, error?: any): string {
    if (error) {
      console.warn(message, error);
    } else {
      console.warn(message);
    }
    if (this.downloadingAlert) {
      this.downloadingAlert.dismiss();
    }
    return 'error';
  }

}
