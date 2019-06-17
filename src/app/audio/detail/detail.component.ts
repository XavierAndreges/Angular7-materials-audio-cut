import { Component, OnInit, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {LocationStrategy, Location} from '@angular/common';

import { AudioFile } from 'src/app/shared/models/types';
import { RequestManager } from 'src/app/shared/services/requestManager';
import { DataManager } from 'src/app/shared/services/dataManager';
import { StorageWorker } from 'src/app/shared/services/storage.service';
import { AudioService } from 'src/app/shared/services/audio.service';
import { UtilsService } from 'src/app/shared/services/utils.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';


declare var WaveSurfer: any;


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})

export class DetailComponent implements OnInit {

  @ViewChild('inputExistingFile') inputExistingFile: ElementRef;
  @ViewChild('previousPage', { read: ElementRef }) btnPreviousPage: ElementRef;
  @ViewChild('nextPage', { read: ElementRef }) btnNextPage: ElementRef;
  @ViewChild('waveform') waveform: ElementRef;
  @ViewChild('loadingSpinner', { read: ElementRef }) loadingSpinner: ElementRef;
  @ViewChild('slider', { read: ElementRef }) slider: ElementRef;
  @ViewChild('iconPlayPause') iconPlayPause: ElementRef;
  @ViewChild('btnAddRegion', { read: ElementRef }) btnAddRegion: ElementRef;
  @ViewChild('btnClearRegion', { read: ElementRef }) btnClearRegion: ElementRef;
  @ViewChild('btnRemoveRegion', { read: ElementRef }) btnRemoveRegion: ElementRef;
  @ViewChild('btnSaveRegion', { read: ElementRef }) btnSaveRegion: ElementRef;
  @ViewChild('btnDownloadRegion', { read: ElementRef }) btnDownloadRegion: ElementRef;

  public audioFile: AudioFile;
  public id: number;
  public index: number;
  public wavesurfer: any = null;
  public minPxPerSec: number;
  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public currentSeek: number = 0;

  public audioContext: AudioContext;
  public arrayBuffer: ArrayBuffer;
  public audioBuffer: AudioBuffer;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dataManager: DataManager,
    public storageWorker: StorageWorker,
    public location: Location,
    public locationStrategy: LocationStrategy,
    public dialog: MatDialog,
    public requestManager: RequestManager,
    public audioService: AudioService,
    public utilsService :UtilsService
  ) {
    console.log("XXX AudioDetailsPage -> constructor() : dataManager", this.dataManager);
   }


  ngOnInit() {

    this.minPxPerSec = 2;

    this.id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.index = this.dataManager.getIndexById(this.dataManager.getAudioFiles(), this.id);
    this.audioFile = this.dataManager.getAudioFiles()[this.index];
    console.log("XXX AudioDetailsPage -> ngOnInit() : this.audioFile", this.audioFile);

  }


  private ngAfterViewInit() {
    console.log("XXX AudioDetailsPage -> ngAfterViewInit()");
    this.chechVisibilityBtn();
    console.log("XXX AudioDetailsPage -> constructor() : ngAfterViewInit", this.dataManager);
    this.initAudio();
  }


  private ngOnDestroy() {
    console.log("XXX AudioDetailsPage -> ngOnDestroy() : isPlaying", this.isPlaying);
    if (this.isPlaying) {
      this.wavesurfer.stop();
    }
  }


  public initAudio() {
    this.audioFile.file = this.dataManager.currentFiles[this.index];
    if (!this.audioFile.file) {
      setTimeout(() => {this.selectExistingFile()}, 1000);
    } else {
      this.setAudio();
    }
  }


  public selectExistingFile() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {"title" : "Information",
            "message": "Le fichier " + this.audioFile.name + "n'est pas chargé en local. Voulez-vous le recharcher maintenant ?",}
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
      this.dataManager.currentFiles[this.index] = this.audioFile.file ;
      this.setAudio();
    } else{
      alert("problème avec le fichier");
    }
  }


  public setAudio(): void {

    this.audioContext = new AudioContext();

    this.createWaveSurfer();
    this.setWaveSurfer();
    this.setEventsWaveSurfer();

      this.requestManager.loadFileAsArrayBuffer(this.utilsService.readBlobURL(this.audioFile.file))
      .subscribe((arrayBuffer: any) => {
        console.log("XXX ListComponent -> setAudio() / loadFileAsArrayBuffer() : arrayBuffer", arrayBuffer);
        this.arrayBuffer = arrayBuffer;
        this.decodeDataToGetAudioBuffer(this.arrayBuffer);
        this.wavesurfer.load(this.utilsService.readBlobURL(this.audioFile.file));
      },
      (err) => {
          console.log("XXX ListComponent -> setAudio() / loadFileAsArrayBuffer() : ERROR", err);
      });

      /*
      //*** autre méthode *********
        var reader = new FileReader();
        reader.onload = (event: any) => {
          console.log("XXX AudioDetailsPage -> setAudio() / readAsArrayBuffer() / OnLoad : event : ", event);
          this.arrayBuffer = event.target.result;
          this.decodeDataToGetAudioBuffer(this.arrayBuffer);
          this.wavesurfer.load(this.utilsService.readBlobURL(this.dataManager.currentFile));
        }
        reader.readAsArrayBuffer(this.dataManager.currentFile);


    }
  */

  }



  public decodeDataToGetAudioBuffer(arrayBuffer: ArrayBuffer): void {
    this.audioContext.decodeAudioData(arrayBuffer).then((res: AudioBuffer) => {
      this.audioBuffer = res;
      console.log("XXX ListComponent -> decodeDataToGetAudioBuffer() : audioBuffer", res);
    })
    .catch((err) => {
      console.log("XXX ListComponent -> decodeDataToGetAudioBuffer() : ERROR", err);
    });
  }


  public handleEncode(type: string) : void {

    for (var first in this.wavesurfer.regions.list) break;
    let startTime = this.wavesurfer.regions.list[first].start;
    let endTime = this.wavesurfer.regions.list[first].end;

    let duration = this.audioBuffer.duration;

    const audioSliced = this.audioService.sliceAudioBuffer(
      this.audioBuffer,
      (this.audioBuffer.length * startTime / duration),
      (this.audioBuffer.length * endTime / duration),
    )

    this.audioService.encode(audioSliced, type)
      .then(this.utilsService.readBlobURL)
      .then(url => {
        this.utilsService.download(url, this.utilsService.rename(this.audioFile.name, type))
      })
      .catch((e) => console.error(e))
  }


  public playSound (arg: string): void {
    //console.log("XXX AudioDetailsPage -> playSound() / FIRST : isPlaying", this.isPlaying);
    if (this.isPlaying || arg === "stop") {
      this.wavesurfer.pause();
      this.iconPlayPause.nativeElement.src = "assets/icon/play-flat.png";
      this.isPlaying = false;
    } else {
      this.wavesurfer.play();
      this.iconPlayPause.nativeElement.src = "assets/icon/pause-flat.png";
      this.isPlaying = true;
    }
    //console.log("XXX AudioDetailsPage -> playSound() / LAST : isPlaying", this.isPlaying);
  }


  public createWaveSurfer(): void {
    this.loadingSpinner.nativeElement.style.display = "block";
    if (this.wavesurfer === null) {
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        height : 150,
        responsive: true,
        normalize: true
      });
    }
  }


  public setWaveSurfer(): void {
    if (this.wavesurfer) {
      this.wavesurfer.empty();
      this.wavesurfer.clearRegions();
      this.wavesurfer.params.minPxPerSec = 2;
      console.log("XXX AudioDetailsPage -> setWaveSurfer() : zoom", this.wavesurfer.params.minPxPerSec);
    }
  }


  public setEventsWaveSurfer(): void {

    var myThis = this;

    this.wavesurfer.on('seek', function (e) {
      console.log("seek : e", e);
      //console.log("XXXX DetailComponent => setEventsWaveSurfer() / ON seek : getCurrentTime", myThis.wavesurfer.getCurrentTime());
      myThis.currentTime = myThis.wavesurfer.getCurrentTime();
      myThis.currentSeek = e;
      myThis.btnSaveRegion.nativeElement.disabled = null;
    });

    this.wavesurfer.on('region-click', function (e) {
      console.log("XXX AudioDetailsPage => setEventsWaveSurfer() / region-click : e", e);
      myThis.btnSaveRegion.nativeElement.disabled = null;
    });

    this.wavesurfer.on('zoom', function (e) {
      console.log("XXX AudioDetailsPage => setEventsWaveSurfer() / zoom : e", e);
      myThis.btnSaveRegion.nativeElement.disabled = null;
    });

    this.wavesurfer.on('ready', () => {
      console.log("XXX AudioDetailsPage -> setEventsWaveSurfer() / READY");

      this.loadingSpinner.nativeElement.style.display = "none";
      this.slider.nativeElement.style.display = "block";
      this.iconPlayPause.nativeElement.style.display = "block";
      this.btnAddRegion.nativeElement.style.display = "block";

      this.placeRegion();
    });

  }



  public setZoomWaveSurfer($event, arg?: string): void {

    console.log("XXX AudioDetailsPage -> setZoomWaveSurfer() : value, arg", $event, arg);

    if (arg) {

      if (arg === "plus" && this.wavesurfer.params.minPxPerSec < 200) {
        this.minPxPerSec = this.wavesurfer.params.minPxPerSec + 2;
      } else if (arg === "minus" && this.wavesurfer.params.minPxPerSec > 2) {
        this.minPxPerSec = this.wavesurfer.params.minPxPerSec - 2;
      }

      this.wavesurfer.zoom(this.minPxPerSec);

    } else {

      this.wavesurfer.zoom(Number($event.value));

    }

    console.log("XXX AudioDetailsPage -> setZoomWaveSurfer : wavesurfer.params.minPxPerSec", this.wavesurfer.params.minPxPerSec);
  }


  public placeRegion() {

    var localAudioFile = this.storageWorker.get("audioFile_" + this.audioFile.id);

    console.log("XXX AudioDetailsPage -> placeRegion() : localAudioFile", localAudioFile);

    console.log("XXX AudioDetailsPage -> placeRegion() : this.wavesurfer.region", this.wavesurfer.region);

    if (localAudioFile) {

      this.audioFile = JSON.parse(localAudioFile);

      this.wavesurfer.addRegion({
        start: this.audioFile.regionStart, // time in seconds
        end: this.audioFile.regionEnd, // time in seconds
        color: 'hsla(100, 100%, 30%, 0.5)',
        loop: true
      });

      this.wavesurfer.seekAndCenter(this.audioFile.seek);

      this.wavesurfer.zoom(this.audioFile.minPxPerSec);

      this.btnClearRegion.nativeElement.style.display = "block";
      this.btnAddRegion.nativeElement.style.display = "none";

      this.btnSaveRegion.nativeElement.style.display = "block";
      this.btnSaveRegion.nativeElement.disabled = "true";

      this.btnRemoveRegion.nativeElement.style.display = "block";
      this.btnRemoveRegion.nativeElement.disabled = null;

      this.btnDownloadRegion.nativeElement.style.display = "block";

      console.log("XXX AudioDetailsPage => placeRegion() : wavesurfer.regions", this.wavesurfer.regions);

    } else {

      this.btnAddRegion.nativeElement.style.display = "block";
      this.btnClearRegion.nativeElement.style.display = "none";

      this.btnSaveRegion.nativeElement.style.display = "none";
      this.btnRemoveRegion.nativeElement.style.display = "none";

      this.btnDownloadRegion.nativeElement.style.display = "none";
    }

  }


  public addRegion() {

    this.wavesurfer.clearRegions();

    this.wavesurfer.addRegion({
            start: this.currentTime, // time in seconds
            end: this.currentTime + 5, // time in seconds
            color: 'hsla(100, 100%, 30%, 0.5)',
            loop: true
          });

    this.wavesurfer.seekAndCenter(this.currentSeek);

    this.btnAddRegion.nativeElement.style.display = "none";
    this.btnClearRegion.nativeElement.style.display = "block";
    this.btnDownloadRegion.nativeElement.style.display = "block";

    console.log("XXX AudioDetailsPage => addRegion() : wavesurfer.regions.list", this.wavesurfer.regions.list);

    this.btnSaveRegion.nativeElement.style.display = "block";
    this.btnSaveRegion.nativeElement.disabled = null;

    this.btnRemoveRegion.nativeElement.style.display = "block";
    if (this.storageWorker.get("audioFile_" + this.audioFile.id)) {
      this.btnRemoveRegion.nativeElement.disabled = null;
    } else {
      this.btnRemoveRegion.nativeElement.disabled = "true";
    }

  }


  public saveRegion() {

    console.log("XXX AudioDetailsPage -> saveRegion() : wavesurfer.regions.list", this.wavesurfer.regions.list);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {"title" : "Attention",
            "message": "Êtes-vous sûr de vouloir enregistrer la région avec ces paramètres ?",
            "name": this.audioFile.name}
    });

    dialogRef.afterClosed().subscribe(result => {

      console.log("XXX AudioDetailsPage => saveRegion() / dialogRef.afterClosed() : result", result);

      if(result) {

        for (var first in this.wavesurfer.regions.list) break;

        this.audioFile.regionStart = this.wavesurfer.regions.list[first].start;
        this.audioFile.regionEnd = this.wavesurfer.regions.list[first].end;
        this.audioFile.seek = this.currentSeek;
        this.audioFile.minPxPerSec = this.wavesurfer.params.minPxPerSec;

        console.log("XXX AudioDetailsPage -> saveRegion() : this.audioFile", this.audioFile);

        this.storageWorker.add("audioFile_" + this.audioFile.id, JSON.stringify(this.audioFile));

        this.btnRemoveRegion.nativeElement.disabled = null;
        this.btnSaveRegion.nativeElement.disabled = "true";

      }

    });

  }


  public removeRegion() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {"title" : "Attention",
            "message": "Êtes-vous sûr de vouloir supprimer définitivement cette région ?"}
    });

    dialogRef.afterClosed().subscribe(result => {

      if(result) {

        console.log("XXX AudioDetailsPage => removeRegion() / dialogRef.afterClosed() : result", result);

        var localAudioFile = this.storageWorker.get("audioFile_" + this.audioFile.id);

        if (localAudioFile) {

          this.storageWorker.remove("audioFile_" + this.audioFile.id);

          this.audioFile.regionStart = null;
          this.audioFile.regionEnd = null;

          this.currentTime = 0;
          this.currentSeek = 0;

          this.wavesurfer.clearRegions();

          this.btnAddRegion.nativeElement.style.display = "block";
          this.btnClearRegion.nativeElement.style.display = "none";

          this.btnSaveRegion.nativeElement.style.display = "none";
          this.btnRemoveRegion.nativeElement.style.display = "none";

        }
      }

    });
  }


  public clearRegion() {

    console.log("XXX AudioDetailsPage => clearRegion() : wavesurfer.regions", this.wavesurfer.regions);

    this.wavesurfer.clearRegions();

    this.btnAddRegion.nativeElement.style.display = "block";
    this.btnClearRegion.nativeElement.style.display = "none";

    this.btnSaveRegion.nativeElement.disabled = "true";
  }


  public goPreviousPage(): void  {
    let index: number = this.dataManager.getIndexById(this.dataManager.getAudioFiles(), this.audioFile.id);
    console.log("XXX AudioDetailsPage -> goPreviousPage() : index", index);
    if (this.index > 0) {
      this.audioFile = this.dataManager.getAudioFiles()[--this.index];
      this.chechVisibilityBtn();
      this.updateItem();
    }
  }


  public goNextPage(): void {
    let index: number = this.dataManager.getIndexById(this.dataManager.getAudioFiles(), this.audioFile.id);
    if (this.index + 1 < this.dataManager.getAudioFiles().length) {
      this.audioFile = this.dataManager.getAudioFiles()[++this.index];
      this.chechVisibilityBtn();
      this.updateItem();
    }
  }


  public chechVisibilityBtn() : void {

    if (this.dataManager.getIndexById(this.dataManager.getAudioFiles(), this.audioFile.id) > 0) {
      this.btnPreviousPage.nativeElement.style.visibility = "visible";
    } else {
      this.btnPreviousPage.nativeElement.style.visibility = "hidden";
    }

    if (this.dataManager.getIndexById(this.dataManager.getAudioFiles(), this.audioFile.id) < this.dataManager.getAudioFiles().length - 1) {
      this.btnNextPage.nativeElement.style.visibility = "visible";
    } else {
      this.btnNextPage.nativeElement.style.visibility = "hidden";
    }

  }


  public updateItem() {

    console.log("XXX AudioDetailsPage -> updateItem() : audioFile", this.audioFile);

    this.slider.nativeElement.style.display = "none";
    this.iconPlayPause.nativeElement.style.display = "none";

    if (this.audioFile.file) {
      this.playSound("stop");
    }

    this.setWaveSurfer();

    this.btnAddRegion.nativeElement.style.display = "none";

    this.initAudio();

    var urlArray = this.locationStrategy.path().split("/");
    var urlNew = urlArray[0] + "/audio/" + this.audioFile.id;
    this.location.go(urlNew);
  }


  public launchBackAction() {
    console.log("XXX AudioDetailsPage -> launchBackAction()");
    this.router.navigateByUrl('/audio');
  }


}
