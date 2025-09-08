import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasillasDialogComponent } from './casillas-dialog.component';

describe('CasillasDialogComponent', () => {
  let component: CasillasDialogComponent;
  let fixture: ComponentFixture<CasillasDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasillasDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasillasDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
