//taskService.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { TaskService } from './task-service';
import { Itask } from '../interfaces/task-interface';
import { environment } from '../../environments/environment';

describe('TaskService', () => {
  let httpTestingController: HttpTestingController;
  let taskService: TaskService;
  let tasks: Itask[];
  let backendUrl = environment.backendUrl;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    taskService = TestBed.inject(TaskService);
    tasks = [
      { title: 'task1', id: '1' },
      { title: 'task2', id: '2' },
      { title: 'task3', id: '3' },
    ];
  });
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(taskService).toBeTruthy();
  });

  describe('searchString$', () => {
    it('should be initialized with empty string', () => {
      expect(taskService.searchString$.value).toBe('');
    });

    it('hould update and emit new value to subscribers', async () => {
      let value: string = '';
      taskService.searchString$.subscribe((newValue: string) => (value = newValue));
      taskService.searchString$.next('new value');
      expect(value).toBe('new value');
    });
  });

  describe('getTasks', () => {
    let myTasks: Itask[];
    beforeEach(() => {
      vi.useFakeTimers();
      myTasks = [];
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call http.get with the correct backend URL', () => {
      taskService.getTasks().subscribe();
      const req = httpTestingController.expectOne(backendUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(backendUrl);
      req.flush([]);
    });

    it('should return the list of tasks when the request succeeds', () => {
      taskService.getTasks().subscribe((allTasks: Itask[]) => {
        myTasks = allTasks;
      });
      const req = httpTestingController.expectOne(backendUrl);
      req.flush(tasks);
      expect(myTasks).toEqual(tasks);
    });

    it('should retry once and return data if the retry succeeds', () => {
      taskService.getTasks().subscribe((allTasks: Itask[]) => {
        myTasks = allTasks;
      });

      const req1 = httpTestingController.expectOne(backendUrl);
      req1.flush(null, { status: 500, statusText: 'Server Error' });

      vi.advanceTimersByTime(1000);

      const req2 = httpTestingController.expectOne(backendUrl);
      req2.flush(tasks);

      expect(myTasks).toEqual(tasks);
    });

    it('should not call http.get more than the configured retry count when all attempts fail', () => {
      let count = 0;
      let errorMessage = '';
      taskService.getTasks().subscribe({
        error: (err) => {
          console.log('err', err);
          errorMessage = err.message;
        },
      });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test exceeded expected number of attempts');
        }
        let req = httpTestingController.expectOne(backendUrl);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }

      // expect(errorMessage).toBe('please try again later');
      expect(count).toBe(2);
    });

    it('should throw an error with message "please try again later" when all retries fail', () => {
      let isStillWaitingForFinalError = true;
      let errorMessage = '';
      let count = 0;
      taskService.getTasks().subscribe({
        error: (err) => {
          isStillWaitingForFinalError = false;
          errorMessage = err.message;
        },
      });
      while (isStillWaitingForFinalError) {
        if (count > 1) {
          throw new Error('test exceeded expected number of attempts');
        }
        let req = httpTestingController.expectOne(backendUrl);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(errorMessage).toBe('please try again later');
    });
  });

  // describe('addTask', () => {
  //   beforeEach(() => {
  //     vi.useFakeTimers();
  //   });
  //   afterEach(() => {
  //     vi.useRealTimers();
  //   });

  //   it('should call http.post with the correct URL and task data', () => {});
  //   it('should return the created task when the request succeeds', () => {});
  //   it('should retry once and return data if the retry succeeds', () => {});
  //   it('should not call http.post more than the configured retry count when all attempts fail', () => {});
  //   it('should throw an error with message "please try again later" when all retries fail', () => {});
  // });
});
