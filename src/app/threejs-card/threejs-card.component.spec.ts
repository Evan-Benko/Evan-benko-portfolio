import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreejsCardComponent } from './threejs-card.component';

describe('ThreejsCardComponent', () => {
  let component: ThreejsCardComponent;
  let fixture: ComponentFixture<ThreejsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreejsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreejsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
