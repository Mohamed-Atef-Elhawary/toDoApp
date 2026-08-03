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
    tasks = [{ title: 'task1' }, { title: 'task2' }, { title: 'task3' }];
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
        const req = httpTestingController.expectOne(backendUrl);
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
        const req = httpTestingController.expectOne(backendUrl);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(errorMessage).toBe('please try again later');
    });
  });

  describe('addTask', () => {
    let responseValue: Itask;
    let mytask: Itask;
    beforeEach(() => {
      vi.useFakeTimers();
      mytask = {} as Itask;
      responseValue = { ...tasks[0], id: '1' };
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call http.post with the correct URL and task data', () => {
      taskService.addTask(tasks[0]).subscribe();
      const req = httpTestingController.expectOne(backendUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(backendUrl);
      expect(req.request.body).toEqual(tasks[0]);
      req.flush(tasks[0]);
    });
    it('should return the created task when the request succeeds', () => {
      taskService.addTask(tasks[0]).subscribe((task) => (mytask = task));
      const req = httpTestingController.expectOne(backendUrl);
      req.flush(responseValue);
      expect(mytask).toEqual(responseValue);
    });

    it('should retry once and return data if the retry succeeds', () => {
      taskService.addTask(tasks[0]).subscribe((task) => (mytask = task));
      const req1 = httpTestingController.expectOne(backendUrl);
      req1.flush(null, { status: 500, statusText: 'server error' });
      vi.advanceTimersByTime(1000);
      const req2 = httpTestingController.expectOne(backendUrl);
      req2.flush(responseValue);
      expect(mytask).toEqual(responseValue);
    });

    it('should not call http.post more than the configured retry count when all attempts fail', () => {
      let errorMessage = '';
      let count = 0;
      taskService.addTask(tasks[0]).subscribe({
        error: (err) => {
          errorMessage = err.message;
        },
      });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test exceeded expected number of attempts');
        }
        const req = httpTestingController.expectOne(backendUrl);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(count).toBe(2);
    });
    it('should throw an error with message "please try again later" when all retries fail', () => {
      let errorMessage: string = '';
      let count: number = 0;
      taskService.addTask(tasks[0]).subscribe({ error: (err) => (errorMessage = err.message) });

      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test exceeded expected number of attempts');
        }
        const req = httpTestingController.expectOne(backendUrl);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);

        count++;
      }

      expect(errorMessage).toBe('please try again later');
    });
  });

  describe('deleteTask', () => {
    let deletedTask: Itask;
    beforeEach(() => {
      deletedTask = { ...tasks[0], id: '1' };
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call http.delete with the correct URL and task id', () => {
      taskService.deleteTask('1').subscribe();
      const req = httpTestingController.expectOne(`${backendUrl}/1`);
      req.flush(deletedTask);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(`${backendUrl}/1`);
    });

    it('should return the deleted task when the request succeeds', () => {
      let myDeletedTask: Itask = {} as Itask;
      taskService.deleteTask('1').subscribe((delTask) => (myDeletedTask = { ...delTask }));
      const req = httpTestingController.expectOne(`${backendUrl}/1`);
      req.flush(deletedTask);
      expect(myDeletedTask).toEqual(deletedTask);
    });
    it('should retry once and return data if the retry succeeds', () => {
      let myDeletedTask: Itask = {} as Itask;
      taskService.deleteTask('1').subscribe((delTask) => (myDeletedTask = { ...delTask }));
      const req1 = httpTestingController.expectOne(`${backendUrl}/1`);
      req1.flush(null, { status: 500, statusText: 'server error' });
      vi.advanceTimersByTime(1000);
      const req2 = httpTestingController.expectOne(`${backendUrl}/1`);
      req2.flush(deletedTask);
      expect(myDeletedTask).toEqual(deletedTask);
    });
    it('should not call http.delete more than the configured retry count when all attempts fail', () => {
      let count: number = 0;
      let errorMessage: string = '';
      taskService.deleteTask('1').subscribe({ error: (err) => (errorMessage = err.message) });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test excceeded the expected number of attempts');
        }
        const req = httpTestingController.expectOne(`${backendUrl}/1`);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(count).toBe(2);
    });
    it('should throw an error with message "please try again later" when all retries fail', () => {
      let errorMessage: string = '';
      let count: number = 0;
      taskService.deleteTask('1').subscribe({ error: (err) => (errorMessage = err.message) });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test ecceeded the expected numner of attempts');
        }
        const req = httpTestingController.expectOne(`${backendUrl}/1`);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(errorMessage).toBe('please try again later');
    });
  });

  describe('updateTask', () => {
    let changes: { isComplete: boolean };
    let updatedTask: Itask;
    beforeEach(() => {
      changes = { isComplete: true };
      updatedTask = { ...tasks[0], id: '1', ...changes };
      vi.useFakeTimers();
    });
    afterEach(() => vi.useRealTimers());

    it('should call the  http.patch with the correct URl, id, and data', () => {
      taskService.updateTask('1', changes).subscribe();
      const req = httpTestingController.expectOne(`${backendUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      expect(req.request.url).toBe(`${backendUrl}/1`);
      req.flush(updatedTask);
    });

    it('should return the updated task when the request succeedes', () => {
      let myUpdatedTask: Itask = {} as Itask;
      taskService
        .updateTask('1', changes)
        .subscribe((upTask: Itask) => (myUpdatedTask = { ...upTask }));
      const req = httpTestingController.expectOne(`${backendUrl}/1`);
      req.flush(updatedTask);
      expect(myUpdatedTask).toEqual(updatedTask);
    });

    it('should retry once and return the data if the  request succeeds', () => {
      let myUpdatedTask: Itask = {} as Itask;
      taskService.updateTask('1', changes).subscribe((upTask) => (myUpdatedTask = { ...upTask }));
      const req1 = httpTestingController.expectOne(`${backendUrl}/1`);
      req1.flush(null, { status: 500, statusText: 'server error' });
      vi.advanceTimersByTime(1000);
      const req2 = httpTestingController.expectOne(`${backendUrl}/1`);
      req2.flush(updatedTask);
      expect(myUpdatedTask).toEqual(updatedTask);
    });

    it('should not call http.patch more than the configured retry count when all attemps fail', () => {
      let errorMessage: string = '';
      let count: number = 0;
      taskService.updateTask('1', changes).subscribe({
        error: (err) => {
          errorMessage = err.message;
        },
      });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test exceeded the expected number of attempts');
        }
        const req = httpTestingController.expectOne(`${backendUrl}/1`);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(count).toBe(2);
    });

    it('should throw an error with message "please try again later" when all retries fail', () => {
      let errorMessage: string = '';
      let count: number = 0;
      taskService.updateTask('1', changes).subscribe({
        error: (err) => {
          errorMessage = err.message;
        },
      });
      while (errorMessage !== 'please try again later') {
        if (count > 1) {
          throw new Error('test exceeded the expected number of attempts');
        }
        const req = httpTestingController.expectOne(`${backendUrl}/1`);
        req.flush(null, { status: 500, statusText: 'server error' });
        vi.advanceTimersByTime(1000);
        count++;
      }
      expect(errorMessage).toBe('please try again later');
    });
  });
});
