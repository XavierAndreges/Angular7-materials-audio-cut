import { Component, OnInit, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-new-audio-dialog',
  templateUrl: './new-audio-dialog.component.html',
  styleUrls: ['./new-audio-dialog.component.css']
})
export class NewAudioDialogComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<NewAudioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
