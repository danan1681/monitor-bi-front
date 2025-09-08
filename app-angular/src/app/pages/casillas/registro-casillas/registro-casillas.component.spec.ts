import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCasillasComponent } from './registro-casillas.component';

describe('RegistroCasillasComponent', () => {
  let component: RegistroCasillasComponent;
  let fixture: ComponentFixture<RegistroCasillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCasillasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroCasillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
