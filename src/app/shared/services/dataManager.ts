import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AudioFile } from '../models/types';

import { catchError, retry } from 'rxjs/operators';
import {Observable} from 'rxjs';

import { StorageWorker } from 'src/app/shared/services/storage.service';


@Injectable()

export class DataManager {

  public currentFiles: Array<File>;
  public firstTimeLaunched: boolean = false;
  public isLoadedFromRoot: boolean = false;

  constructor(
    public http: HttpClient,
    private storageWorker: StorageWorker
  ) {
    this.currentFiles = [];
  }

  public getIndexById(_array: any, id: number):number {
      var index: number;
      _array.forEach((item, i) => {
          if (item.id === id) {
            index = i;
          }
      });
      return index;
  }

  public updateAudioFile(file: AudioFile):void {
    let audioFiles = this.getAudioFiles();
    let index = this.getIndexById(audioFiles, file.id);
    audioFiles[index] = file;
    this.storageWorker.add("audioFiles", JSON.stringify(audioFiles));
  }

  public addAudioFile(newFile: AudioFile): void {
      console.log("XXX DataManager -> addAudioFile() : newFile", newFile);
      let audioFiles = this.getAudioFiles();
      console.log("XXX DataManager -> addAudioFile() : audioFiles", audioFiles);
      audioFiles.push(newFile);
      console.log("XXX DataManager -> addAudioFile() : audioFiles", audioFiles);
      this.storageWorker.add("audioFiles", JSON.stringify(audioFiles));
  }

  public getAudioFiles(): Array<AudioFile> {
    let audioFiles : any = this.storageWorker.get("audioFiles");
    if (audioFiles) {
      return JSON.parse(audioFiles);
    }
  }

/*
  public initAudioFiles(): Array<AudioFile> {
    let audioFiles = this.getAudioFiles();
    console.log("XXX DataManager -> initAudioFiles() : audioFiles", audioFiles);
    if (audioFiles) {
      return this.items.concat(audioFiles);
    } else {
      return this.items;
    }
  }
  */
}
