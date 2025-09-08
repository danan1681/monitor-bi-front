import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpatizantesComponent } from './simpatizantes.component';

describe('SimpatizantesComponent', () => {
  let component: SimpatizantesComponent;
  let fixture: ComponentFixture<SimpatizantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpatizantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpatizantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
