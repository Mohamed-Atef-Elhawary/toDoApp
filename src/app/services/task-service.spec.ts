//taskService.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Itask } from '../interfaces/task-interface';
import { environment } from '../../environments/environment';

describe('TaskService', () => {
  let httpTestingController: HttpTestingController;
  let taskService: TaskService;
  let tasks: Itask[];
  let backendUrl = environment.backendUrl;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClientTesting(), provideHttpClient()],
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
});
