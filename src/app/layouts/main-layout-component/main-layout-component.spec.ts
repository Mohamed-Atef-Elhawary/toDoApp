import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout-component';
import { Component, DebugElement } from '@angular/core';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar-component',
  template: '',
})
class NavbarStubComponent {}

@Component({ selector: 'app-sidebar-component', template: '' })
class SidebarStubComponent {}

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let debugEle: DebugElement;
  let navbar: DebugElement;
  let sidebar: DebugElement;
  let routerOutlet: DebugElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({})
      .overrideComponent(MainLayoutComponent, {
        remove: { imports: [NavbarComponent, SidebarComponent] },
        add: { imports: [NavbarStubComponent, SidebarStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    debugEle = fixture.debugElement;
    navbar = debugEle.query(By.css('app-navbar-component'));
    sidebar = debugEle.query(By.css('app-sidebar-component'));
    routerOutlet = debugEle.query(By.css('router-outlet'));
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render app-navbar-component', () => {
    expect(navbar).toBeTruthy();
    expect(navbar.componentInstance).toBeInstanceOf(NavbarStubComponent);
  });
  it('should render app-sidebar-component', () => {
    expect(sidebar).toBeTruthy();
  });
  it('should render router-outlet', () => {
    expect(routerOutlet).toBeTruthy();
  });
  it('should render navbar before sidebar and router-outlet', () => {
    const navbarBeforeSidebar = navbar.nativeElement.compareDocumentPosition(sidebar.nativeElement);
    expect(navbarBeforeSidebar & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const sidebarBeforeRouterOutlet = sidebar.nativeElement.compareDocumentPosition(
      routerOutlet.nativeElement,
    );
    expect(sidebarBeforeRouterOutlet & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
