import { vi } from 'vitest';
import { NavbarComponent } from './navbar-component';

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
  // describe('NavbarComponent.html', () => {});
});
