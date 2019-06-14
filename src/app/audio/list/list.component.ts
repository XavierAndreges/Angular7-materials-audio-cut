import { Component, OnInit, ElementRef,  QueryList, ViewChildren, ViewChild, Renderer2 } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AudioFile } from 'src/app/shared/models/types';
import { DataManager } from 'src/app/shared/services/dataManager';
import { StorageWorker } from 'src/app/shared/services/storage.service';
import { UtilsService } from 'src/app/shared/services/utils.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { NewAudioDialogComponent } from 'src/app/shared/components/new-audio-dialog/new-audio-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {

  @ViewChildren('iconPlayPause') iconPlayPause: QueryList<ElementRef>;
  @ViewChild('inputFile') inputFile: ElementRef;
  @ViewChild('inputExistingFile') inputExistingFile: ElementRef;

  icons: string[];
  audioFiles: Array<AudioFile>;
  audioFile: AudioFile;
  presentSound: string;
  previousSound: string;
  audio: HTMLAudioElement;
  data: any;
  wavesurfer: any;
  minPxPerSec: number;


  constructor(
    private router: Router,
    public dataManager: DataManager,
    private renderer: Renderer2,
    private storageWorker: StorageWorker,
    public dialog: MatDialog,
    public utilsService: UtilsService
  ) { }


  ngOnInit() {
    this.presentSound = null;
    this.previousSound = null;
    this.audioFiles = this.dataManager.getAudioFiles();
    console.log("ListAudioPage -> ngOnInit : audioFiles", this.audioFiles);
  }


  public itemTapped(event: any, audioFile: AudioFile) {
    if (this.audio) {
      this.stopSound(audioFile.id);
    }
    this.dataManager.isLoadedFromRoot = true;
    this.router.navigateByUrl('/audio/' + audioFile.id);
    console.log("ListAudioPage ->  constructor : iconPlayPause", this.iconPlayPause);
  }


  public playSound (event: any, id: number) : void {

    console.log("listAudio -> playSound : id : ", id);
    //console.log("listAudio -> playSound : presentSound : ", this.presentSound);
    //console.log("listAudio -> playSound : previousSound : ", this.previousSound);

    event.stopPropagation();

    if (!this.presentSound || ("iconPlayPause" + id !== this.presentSound)) {

      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }

      let index = this.dataManager.getIndexById(this.audioFiles, id);
      this.audioFile = this.audioFiles[index];
      this.audioFile.file = this.dataManager.currentFiles[index];

      if (!this.audioFile.file) {

        console.log("XXX ListComponent => playSound() / file === null : audioFile", this.audioFile);
        this.selectExistingFile();

      } else {

        console.log("XXX ListComponent => playSound() / file !== null : audioFile", this.audioFile);
        this.setAudio();
      }

    } else {
        this.stopSound(id);
    };
  }


  private stopSound(id: number) {

    this.audio.pause();
    this.audio = null;
    this.presentSound = null;
    this.previousSound = null;

    this.iconPlayPause.forEach(icon => {
      if (icon.nativeElement.id == ("iconPlayPause" + id)) {
        icon.nativeElement.src = "assets/icon/play-flat.png";
      }
    });

  }


  private setAudio() {

    this.audio = new Audio(this.utilsService.readBlobURL(this.audioFile.file));
    this.audio.play();
    this.audio.loop = true;

    this.presentSound = "iconPlayPause" + this.audioFile.id;

    this.iconPlayPause.forEach(icon => {
      if (this.presentSound == icon.nativeElement.id) {
        icon.nativeElement.src = "assets/icon/pause-flat.png";
      } else if (this.previousSound == icon.nativeElement.id) {
        icon.nativeElement.src = "assets/icon/play-flat.png";
      }
    });

    this.previousSound = this.presentSound;

  }


  public selectExistingFile() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {"title" : "Information",
            "message": "Le fichier " + this.audioFile.name + "n'est plus chargé en local. Voulez-vous le recharcher à  nouveau ?",}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("XXX ListComponent => selectExistingFile() / dialogRef.afterClosed() : result", result);
      if(result) {
        this.inputExistingFile.nativeElement.click();
      }
    });
  }


  public setExistingFile(event): void {
    console.log("XXX ListComponent -> setExistingFile() : event : ", event);
    this.audioFile.file = this.utilsService.getFileIfAudio(event);
    if (this.audioFile.file) {
      let index = this.dataManager.getIndexById(this.audioFiles, this.audioFile.id);
      this.dataManager.currentFiles[index] = this.audioFile.file;
      console.log("XXX AudioDetailsPage => setExistingFile() : this.dataManager.currentFiles", this.dataManager.currentFiles);
      this.setAudio();
    }
  }


  public addNewAudioFile(): void {
    this.inputFile.nativeElement.click();
  }


  public setNewAudioFile(event): void {
    console.log("XXX ListComponent -> setNewAudioFile : event : ", event);
    if (this.utilsService.getFileIfAudio(event)) {
      this.saveNewFile(files[0]);
    }
  }


  public saveNewFile(file) {

    let last: number = this.audioFiles.length - 1;
    let id = last == -1 ? 0 : this.audioFiles[last].id + 1;

    this.audioFile = new AudioFile(id, file.name);

    const dialogRef = this.dialog.open(NewAudioDialogComponent, {
      width: '350px',
      data: {"title" : "Attention",
            "message": "Quel nom souhaitez-vous donner à votre nouveau fichier audio?",
            "name": file.name}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("XXX AudioDetailsPage => saveNewFile() / dialogRef.afterClosed() : result", result);
      if(result) {

        this.audioFile.name = result;
        this.dataManager.addAudioFile(this.audioFile);
        this.audioFiles = this.dataManager.getAudioFiles();

        //file could not be saved in localStorage
        this.audioFile.file = file;
        let index = this.dataManager.getIndexById(this.audioFiles, id);
        this.dataManager.currentFiles[index] = file;
        console.log("XXX AudioDetailsPage => saveNewFile() : this.dataManager.currentFiles", this.dataManager.currentFiles);
      }
    });
  }
}
