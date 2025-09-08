import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaSimpatizantesComponent } from './mapa-simpatizantes.component';

describe('MapaSimpatizantesComponent', () => {
  let component: MapaSimpatizantesComponent;
  let fixture: ComponentFixture<MapaSimpatizantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaSimpatizantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaSimpatizantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
