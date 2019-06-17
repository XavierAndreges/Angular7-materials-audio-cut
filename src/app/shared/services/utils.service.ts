import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public range (min: number, max: number): Array<any> {
    return Array
    .apply(null, { length: max - min + 1 })
    .map((v, i) => i + min);
  }

  public readBlobURL(file: File): string {
    console.log("XXX UtilsService -> readBlobURL() : file", file);
    return URL.createObjectURL(file);
  }

  public download (url: string, name: string) : void {
    console.log("XXX ListComponent -> download() : url, name", url, name);
    const link = document.createElement('a')
    link.href = url;
    link.download = name
    link.click()
  }

  public rename (filename: string, ext: string, stamp?: any): string {
    return `${filename.replace(/\.\w+$/, '')}${stamp || ''}.${ext}`;
  }


  public getFileIfAudio(event: any): File {

    console.log("XXX UtilsService -> getFileIfAudio() : event : ", event);

    var allowedTypes = ['wav', 'mp3', 'mpeg3', 'ogg', "pcm", "aiff", "aac", "wma", "flac", "alac" ];
    var files = event.target.files;

    if (files && files[0]) {

      console.log("XXX UtilsService -> setExistingFile : files", files);

      var imgType = files[0].name.split('.');
      imgType = imgType[imgType.length - 1];

      if (allowedTypes.indexOf(imgType) != -1) {
        return files[0];
      } else {
        return null;
      }
    }
  }


}
