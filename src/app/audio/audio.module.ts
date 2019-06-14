import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailComponent } from './detail/detail.component';
import { SingleSelectionComponent } from './single-selection/single-selection.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ListComponent
      },
      {
        path: 'audio',
        component: ListComponent
      },
      {
        path: 'audio/:id',
        component: DetailComponent
      },
      {
        path: 'single',
        component: SingleSelectionComponent
      },
      {
        path: 'single/cut',
        component: DetailComponent
      }
    ])
  ],
  declarations: [ListComponent, DetailComponent, SingleSelectionComponent]
})
export class AudioModule { }
