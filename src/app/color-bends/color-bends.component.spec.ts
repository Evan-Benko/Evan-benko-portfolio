import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorBendsComponent } from './color-bends.component';

describe('ColorBendsComponent', () => {
  let component: ColorBendsComponent;
  let fixture: ComponentFixture<ColorBendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorBendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorBendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
