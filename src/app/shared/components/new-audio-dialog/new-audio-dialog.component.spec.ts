import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAudioDialogComponent } from './new-audio-dialog.component';

describe('NewAudioDialogComponent', () => {
  let component: NewAudioDialogComponent;
  let fixture: ComponentFixture<NewAudioDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAudioDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAudioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
