import { Component, OnInit, ElementRef,  QueryList, ViewChildren, ViewChild, Renderer2 } from "@angular/core";
import { DataManager } from 'src/app/shared/services/dataManager';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-single-selection',
  templateUrl: './single-selection.component.html',
  styleUrls: ['./single-selection.component.css']
})

export class SingleSelectionComponent implements OnInit {

  @ViewChild('inputFile') inputFile: ElementRef;

  constructor(
    public dataManager: DataManager,
    public router: Router
  ) { }

  ngOnInit() {
  }


  public addNewAudioFile(): void {
    this.inputFile.nativeElement.click();
  }


  public setNewAudioFile(event): void {

    console.log("XXX SingleSelectionComponent -> setNewAudioFile : event : ", event);

    var allowedTypes = ['wav', 'mp3', 'mpeg3', 'ogg', "pcm", "aiff", "aac", "wma", "flac", "alac" ];
    var files = event.target.files;

    if (files && files[0]) {

      console.log("XXX SingleSelectionComponent -> setNewAudioFile : files", files);

      var imgType = files[0].name.split('.');
      imgType = imgType[imgType.length - 1];

      if (allowedTypes.indexOf(imgType) != -1) {

        /*
        var reader = new FileReader();
        reader.onload = (event: any) => {
          console.log("XXX SingleSelectionComponent -> setNewAudioFile / FileReader / OnLoad : event : ", event);
          this.dataManager.currentFile = event;
          this.router.navigateByUrl('/' + "single");
        }
        reader.readAsDataURL(event.target.files[0]);
*/

        this.dataManager.currentFiles[0] = files[0];
        this.router.navigateByUrl('/single/cut');



      }
    }
  }

}
