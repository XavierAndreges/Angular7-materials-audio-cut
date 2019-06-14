import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import { DataManager } from './services/dataManager';
import { RequestManager } from './services/requestManager';
import { StorageWorker } from './services/storage.service';
import { AudioService } from './services/audio.service';
import { UtilsService } from './services/utils.service';


import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { NewAudioDialogComponent } from './components/new-audio-dialog/new-audio-dialog.component';

@NgModule({
  declarations: [ConfirmationDialogComponent, NewAudioDialogComponent],
  imports: [
    FormsModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports : [
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    NewAudioDialogComponent
  ],
  providers: [
    DataManager,
    StorageWorker,
    RequestManager,
    AudioService,
    UtilsService
  ]
})
export class SharedModule { }
