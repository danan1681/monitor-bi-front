import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosDialogComponent } from './eventos-dialog.component';

describe('EventosDialogComponent', () => {
  let component: EventosDialogComponent;
  let fixture: ComponentFixture<EventosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
