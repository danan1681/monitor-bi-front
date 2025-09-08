import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidaturasDialogComponent } from './candidaturas-dialog.component';

describe('CandidaturasDialogComponent', () => {
  let component: CandidaturasDialogComponent;
  let fixture: ComponentFixture<CandidaturasDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidaturasDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidaturasDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
