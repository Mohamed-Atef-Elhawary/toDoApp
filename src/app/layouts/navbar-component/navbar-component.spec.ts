import { vi } from 'vitest';
import { NavbarComponent } from './navbar-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskService } from '../../services/task-service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  describe('NavbarComponent.ts', () => {
    let mockTaskService: any;
    let navbarComponent: NavbarComponent;
    beforeEach(async () => {
      mockTaskService = {
        searchString$: {
          next: vi.fn(),
        },
      };

      navbarComponent = new NavbarComponent(mockTaskService);
    });

    it('should create', () => {
      expect(navbarComponent).toBeTruthy();
    });

    it('should initialize searchString with an empty string', () => {
      expect(navbarComponent.searchString).toBe('');
    });

    it('should call taskservice.searchString$.next() with the current searchString value when onInput() is called', () => {
      navbarComponent.searchString = 'new value';
      navbarComponent.onInput();
      expect(mockTaskService.searchString$.next).toHaveBeenCalledWith('new value');
    });

    it('should call taskservice.searchString$.next() exactly once per onInput() call', () => {
      for (let i = 0; i < 5; i++) {
        navbarComponent.onInput();
      }
      expect(mockTaskService.searchString$.next).toHaveBeenCalledTimes(5);
    });

    it('should call taskservice.searchString$.next() with the latest value on each successive onInput() call', () => {
      let count: number = 0;
      for (let i = 0; i < 5; i++) {
        count++;
        navbarComponent.searchString = `value number ${count}`;
        navbarComponent.onInput();
      }
      expect(mockTaskService.searchString$.next).toHaveBeenLastCalledWith(`value number ${count}`);
    });

    it('should call taskservice.searchString$.next() with an empty string when searchString is cleared', () => {
      navbarComponent.searchString = 'old value';
      navbarComponent.onInput();
      navbarComponent.searchString = '';
      navbarComponent.onInput();
      expect(mockTaskService.searchString$.next).toHaveBeenCalledWith('');
    });
  });
  describe('NavbarComponent.html', () => {
    let fixture: ComponentFixture<NavbarComponent>;
    let debugEle: DebugElement;
    let navbarComponent: NavbarComponent;
    let myInput: DebugElement;
    let nativeInput: HTMLInputElement;

    beforeEach(() => {
      let mockTaskService = { searchString$: { next: vi.fn() } };
      TestBed.configureTestingModule({
        providers: [{ provide: TaskService, useValue: mockTaskService }],
      });
      fixture = TestBed.createComponent(NavbarComponent);
      navbarComponent = fixture.componentInstance;
      debugEle = fixture.debugElement;
      fixture.detectChanges();
      myInput = debugEle.query(By.css('input'));
      nativeInput = myInput.nativeElement as HTMLInputElement;
      vi.spyOn(navbarComponent, 'onInput');
    });
    it('should create the input field', () => {
      expect(debugEle.query(By.css('input'))).toBeTruthy();
    });
    it('should initialize the input value with searchString', async () => {
      navbarComponent.searchString = 'test value';
      fixture.detectChanges();
      await fixture.whenStable();
      const value: string = (myInput.nativeElement as HTMLInputElement).value;
      expect(value).toBe(fixture.componentInstance.searchString);
    });

    it('should update the searchString with the latest value entered by the user', () => {
      nativeInput.value = 'new value';
      nativeInput.dispatchEvent(new InputEvent('input'));
      expect(navbarComponent.searchString).toBe('new value');
    });
    it('should update the input field with the latest searchString value coming from the component', async () => {
      navbarComponent.searchString = 'first value';
      fixture.detectChanges();
      await fixture.whenStable();
      expect(nativeInput.value).toBe('first value');
      navbarComponent.searchString = 'last value';
      fixture.detectChanges();
      await fixture.whenStable();
      expect(nativeInput.value).toBe('last value');
    });
    it('should call onInput() whenever the input value changes', () => {
      nativeInput.value = 'value 1';
      nativeInput.dispatchEvent(new InputEvent('input'));
      expect(navbarComponent.onInput).toHaveBeenCalledTimes(1);
    });
    it('should call onInput() once for each input value change', () => {
      let count = 0;
      for (let i = 0; i < 5; i++) {
        nativeInput.value = `value ${i + 1}`;
        nativeInput.dispatchEvent(new InputEvent('input'));
        count++;
      }
      expect(navbarComponent.onInput).toHaveBeenCalledTimes(count);
    });
    it('should call onInput() when entire input field value is removed', () => {
      nativeInput.value = 'old value';
      nativeInput.dispatchEvent(new InputEvent('input'));
      nativeInput.value = '';
      nativeInput.dispatchEvent(new InputEvent('input'));
      expect(navbarComponent.onInput).toHaveBeenCalledTimes(2);
    });
  });
});
