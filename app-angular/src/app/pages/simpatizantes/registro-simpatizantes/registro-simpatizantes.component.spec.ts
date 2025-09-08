import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSimpatizantesComponent } from './registro-simpatizantes.component';

describe('RegistroSimpatizantesComponent', () => {
  let component: RegistroSimpatizantesComponent;
  let fixture: ComponentFixture<RegistroSimpatizantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroSimpatizantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroSimpatizantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
