import { TestBed } from '@angular/core/testing';
import { TaskService } from './task-service';

import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ibins, Itask } from '../interfaces/task-interface';
describe('TaskService', () => {
  let taskService: TaskService;
  let httpTestingController: HttpTestingController;
  let fullBackendUrl = `${environment.backendUrl}/${environment.binId}`;
  let tasks = [
    { title: 't1', id: '1' },
    { title: 't2', id: '2' },
    { title: 't3', id: '3' },
    { title: 't4', id: '4' },
    { title: 't5', id: '5' },
  ];
  let IbinsResponse: Ibins = {
    metadata: { createdAt: '00', id: '1', private: true },
    record: {
      tasks,
    },
  };
  let httpErrorResponse = new HttpErrorResponse({
    status: 500,
    statusText: 'server error',
  });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });

    taskService = TestBed.inject(TaskService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe('search string BehaviorSubject', () => {
    it('should emit the initial value to the subscribers', async () => {
      taskService.searchString$.next('initial value');
      let value = await firstValueFrom(taskService.searchString$);
      expect(value).toBe('initial value');
    });
    it('should emit the new value to the subscribers', () => {
      let newValue: string = '';
      taskService.searchString$.subscribe((value) => (newValue = value));
      taskService.searchString$.next('new value');
      expect(newValue).toBe('new value');
    });
  });

  describe('getTasks', () => {
    afterEach(() => {
      httpTestingController.verify();
    });
    it('should call http.get with correct url', () => {
      taskService.getTasks().subscribe();
      const req = httpTestingController.expectOne(fullBackendUrl);
      expect(req.request.method).toBe('GET');
      req.flush(IbinsResponse);
    });
    it('should should set headers when call http.get', () => {
      taskService.getTasks().subscribe();
      const req = httpTestingController.expectOne(fullBackendUrl);
      expect(req.request.headers.get('X-Master-Key')).toBe(environment.masterKey);
      req.flush(IbinsResponse);
    });
    describe('when the request succees', () => {
      it('should return Itask[] when the request succees', () => {
        let myRecievedTasks: Itask[] = [];
        taskService.getTasks().subscribe((recievedTasks: Itask[]) => {
          myRecievedTasks = recievedTasks;
        });
        let req = httpTestingController.expectOne(fullBackendUrl);
        req.flush(IbinsResponse);
        expect(myRecievedTasks).toEqual(IbinsResponse.record.tasks);
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });
      afterEach(() => {
        vi.useRealTimers();
      });
      it('should retry once if the request fails', () => {
        let myRecievedTasks: Itask[] = [];
        taskService.getTasks().subscribe((recievedTasks) => {
          myRecievedTasks = recievedTasks;
        });
        const req1 = httpTestingController.expectOne(fullBackendUrl);
        req1.flush(null, httpErrorResponse);
        vi.advanceTimersByTime(1000);
        const req2 = httpTestingController.expectOne(fullBackendUrl);
        req2.flush(IbinsResponse);
        expect(myRecievedTasks).toEqual(IbinsResponse.record.tasks);
      });
      it('should throwError with message "please try again later" when the request fails', () => {
        let myErrorMessage: string = '';
        taskService.getTasks().subscribe({
          error: (err) => {
            myErrorMessage = err.message;
          },
        });
        const req1 = httpTestingController.expectOne(fullBackendUrl);
        req1.flush(null, httpErrorResponse);
        vi.advanceTimersByTime(1000);
        const req2 = httpTestingController.expectOne(fullBackendUrl);
        req2.flush(null, httpErrorResponse);
        expect(myErrorMessage).toBe('please try again later');
      });
    });
  });

  describe('modifyTasks', () => {
    afterEach(() => {
      httpTestingController.verify();
    });
    it('should call http.put with correct url', () => {
      taskService.modifyTasks(tasks).subscribe();
      const req = httpTestingController.expectOne(fullBackendUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.url).toBe(fullBackendUrl);
      req.flush(IbinsResponse);
    });
    it('should should set headers when call http.put', () => {
      taskService.modifyTasks(tasks).subscribe();
      const req = httpTestingController.expectOne(fullBackendUrl);
      expect(req.request.headers.get('X-Master-Key')).toBe(environment.masterKey);
      req.flush(IbinsResponse);
    });

    describe('when the request succees', () => {
      it('should return Itask[] when the request succees', () => {
        let myRecievedTasks: Itask[] = [];
        taskService.modifyTasks(tasks).subscribe((recievedTasks: Itask[]) => {
          myRecievedTasks = recievedTasks;
        });
        const req = httpTestingController.expectOne(fullBackendUrl);
        req.flush(IbinsResponse);
        expect(myRecievedTasks).toEqual(IbinsResponse.record.tasks);
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });
      afterEach(() => {
        vi.useRealTimers();
      });
      it('should retry once if the request fails', () => {
        let myRecievedTasks: Itask[] = [];
        taskService.modifyTasks(tasks).subscribe((recievedTasks: Itask[]) => {
          myRecievedTasks = recievedTasks;
        });
        const req1 = httpTestingController.expectOne(fullBackendUrl);
        req1.flush(null, httpErrorResponse);
        vi.advanceTimersByTime(1000);
        const req2 = httpTestingController.expectOne(fullBackendUrl);
        req2.flush(IbinsResponse);
        expect(myRecievedTasks).toEqual(IbinsResponse.record.tasks);
      });
      it('should throwError with message "please try again later" when the request fails', () => {
        let myErrorMessage: string = '';
        taskService.modifyTasks(tasks).subscribe({
          error: (err) => {
            myErrorMessage = err.message;
          },
        });
        const req1 = httpTestingController.expectOne(fullBackendUrl);
        req1.flush(null, httpErrorResponse);
        vi.advanceTimersByTime(1000);
        const req2 = httpTestingController.expectOne(fullBackendUrl);
        req2.flush(null, httpErrorResponse);
        expect(myErrorMessage).toBe('please try again later');
      });
    });
  });
});
