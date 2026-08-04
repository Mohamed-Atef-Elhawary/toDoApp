import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar-component';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
@Component({
  template: '',
  styles: [],
})
class MockComponent {}
describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let sidebarComponent: SidebarComponent;
  let debugEle: DebugElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([{ path: 'tasks/:category', component: MockComponent }])],
    }).compileComponents();
    fixture = TestBed.createComponent(SidebarComponent);
    sidebarComponent = fixture.componentInstance;
    debugEle = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create the SidebarComponent', () => {
    expect(sidebarComponent).toBeTruthy();
  });

  it('should render the same number of list items as asideLinks array length', () => {
    const lis: DebugElement[] = debugEle.queryAll(By.css('li'));
    expect(lis.length).toBe(sidebarComponent.asideLinks.length);
  });

  it('should display each link text in the correct order matching asideLinks values', () => {
    const lis: DebugElement[] = debugEle.queryAll(By.css('li'));
    lis.forEach((li: DebugElement, index: number) => {
      const aTag: HTMLAnchorElement = li.query(By.css('a')).nativeElement as HTMLAnchorElement;
      expect(aTag.textContent.trim()).toBe(sidebarComponent.asideLinks[index].trim());
    });
  });

  it('should generate correct routerLink for each anchor based on its corresponding value', () => {
    const lis: DebugElement[] = debugEle.queryAll(By.css('li'));
    lis.forEach((li: DebugElement, index: number) => {
      const aDebug: DebugElement = li.query(By.css('a'));
      const link = aDebug.injector.get(RouterLink).href;
      expect(link).toBe(`/tasks/${sidebarComponent.asideLinks[index].toLowerCase()}`);
    });
  });
  describe('routerLinkActive', () => {
    let router: Router;
    let lis: DebugElement[];
    let expectedActiveClasses: string[];
    beforeEach(async () => {
      router = TestBed.inject(Router);
      await router.navigate(['/tasks', sidebarComponent.asideLinks[1].toLocaleLowerCase()]);
      fixture.detectChanges();
      lis = debugEle.queryAll(By.css('li'));
      expectedActiveClasses = [
        'active',
        'text-white',
        'bg-sky-200',
        'border-l-2',
        'border-red-500',
      ];
    });
    it('should apply routerLinkActive classes to the link matching the current route', () => {
      const currentAlink: DebugElement = lis[1].query(By.css('a'));

      expect(Object.keys(currentAlink.classes)).toEqual(
        expect.arrayContaining(expectedActiveClasses),
      );
    });

    it('should not apply routerLinkActive classes to links that do not match the current route', () => {
      lis.forEach((li: DebugElement, index: number) => {
        if (index !== 1) {
          const currentAlink: DebugElement = li.query(By.css('a'));
          expect(Object.keys(currentAlink.classes)).not.contain('active');
        }
      });
    });
  });
});
