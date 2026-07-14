import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFouneComponent } from './not-foune-component';

describe('NotFouneComponent', () => {
  let component: NotFouneComponent;
  let fixture: ComponentFixture<NotFouneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFouneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFouneComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
