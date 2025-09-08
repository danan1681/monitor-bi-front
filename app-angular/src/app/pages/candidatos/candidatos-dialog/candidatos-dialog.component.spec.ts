import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatosDialogComponent } from './candidatos-dialog.component';

describe('CandidatosDialogComponent', () => {
  let component: CandidatosDialogComponent;
  let fixture: ComponentFixture<CandidatosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
