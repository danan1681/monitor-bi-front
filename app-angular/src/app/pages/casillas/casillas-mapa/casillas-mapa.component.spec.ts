import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasillasMapaComponent } from './casillas-mapa.component';

describe('CasillasMapaComponent', () => {
  let component: CasillasMapaComponent;
  let fixture: ComponentFixture<CasillasMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasillasMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasillasMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
