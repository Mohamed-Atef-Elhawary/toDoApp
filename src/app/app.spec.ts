import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MainLayoutComponent } from './layouts/main-layout-component/main-layout-component';
describe('App', () => {
  let fixture: ComponentFixture<App>;
  let debugEle: DebugElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    debugEle = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should instantiate and include the MainLayoutComponent class', () => {
    const mainLayoutComponent: DebugElement = debugEle.query(By.directive(MainLayoutComponent));
    expect(mainLayoutComponent).toBeTruthy();
    expect(mainLayoutComponent.componentInstance).toBeInstanceOf(MainLayoutComponent);
  });

  it('should render the app-main-layout-component', () => {
    let mainLayoutComponent = fixture.nativeElement as HTMLElement;
    expect(mainLayoutComponent.querySelector('app-main-layout-component')).not.toBeNull();
  });
});
