import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks-component';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task-service';
import { ToastrService } from 'ngx-toastr';
import { Itask } from '../../interfaces/task-interface';
import { Mock } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
type MockTaskService = {
  searchString$: BehaviorSubject<string>;
  getTasks: Mock;
  addTask: Mock;
  updateTask: Mock;
  deleteTask: Mock;
};
describe('TasksComponent', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let tasksComponent: TasksComponent;
  let mockActivatedRoute: any;
  let mockTaskService: MockTaskService;
  let mockToastrService: any;
  let tasks: Itask[];
  beforeEach(async () => {
    let spyActivatedRoute = { paramMap: of({ get: vi.fn() }) };
    let spyTaskService: MockTaskService = {
      searchString$: new BehaviorSubject(''),
      getTasks: vi.fn(() => of()),
      addTask: vi.fn(() => of({})),
      updateTask: vi.fn(() => of({})),
      deleteTask: vi.fn(() => of({})),
    };
    let spyToastrService = { success: vi.fn(), error: vi.fn() };
    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: spyActivatedRoute },
        { provide: TaskService, useValue: spyTaskService },
        { provide: ToastrService, useValue: spyToastrService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TasksComponent);
    tasksComponent = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute);
    mockTaskService = TestBed.inject(TaskService) as unknown as MockTaskService;
    mockToastrService = TestBed.inject(ToastrService);
    tasks = [{ title: 't1' }, { title: 't2' }, { title: 't3' }, { title: 't4' }, { title: 't5' }];
  });

  it('should create the app', () => {
    expect(tasksComponent).toBeTruthy();
  });

  describe('Setting category from route param', () => {
    it('should set the category to the value from the route param when it exists', () => {
      mockActivatedRoute.paramMap = of({ get: vi.fn((category: string) => 'important') });
      fixture.detectChanges();
      expect(tasksComponent.category()).toBe('important');
    });
    it('should default the category to "all" when the route param is missing', () => {
      mockActivatedRoute.paramMap = of({ get: (category: string) => {} });
      fixture.detectChanges();
      expect(tasksComponent.category()).toBe('all');
    });
  });

  describe('Filtering tasks by searchString', () => {
    beforeEach(() => {
      mockTaskService.getTasks.mockReturnValue(of(tasks));

      fixture.detectChanges();
    });
    it('should set storedTasks to allTasks if there is no searchString', () => {
      expect(tasksComponent.allTasks(), 'allTasks should match fetched tasks').toEqual(tasks);
      expect(tasksComponent.storedTasks(), 'storedTasks should match fetched tasks').toEqual(tasks);
    });
    it('should return only tasks whose title includes the search string', () => {
      mockTaskService.searchString$.next('1');
      expect(tasksComponent.allTasks()).toEqual([{ title: 't1' }]);
    });
    it('should stop the emission after destroying', () => {
      mockTaskService.searchString$.next('t1');
      expect(tasksComponent.allTasks()).toEqual([{ title: 't1' }]);
      fixture.destroy();
      mockTaskService.searchString$.next('t2');
      expect(tasksComponent.allTasks()).toEqual([{ title: 't1' }]);
    });
  });

  describe('Loading tasks at ngOnInit ', () => {
    describe('When API call succeeds', () => {
      it('should set tasks to allTasks and storedTasks', () => {
        mockTaskService.getTasks.mockReturnValue(of(tasks));
        fixture.detectChanges();
        expect(tasksComponent.allTasks()).toEqual(tasks);
        expect(tasksComponent.storedTasks()).toEqual(tasks);
      });
    });
    describe('When API call fails', () => {
      let httpErrorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'server error',
      });
      it('should call toastr.error with err.message and FailConfig', () => {
        mockTaskService.getTasks.mockReturnValue(throwError(() => httpErrorResponse));
        fixture.detectChanges();
        expect(mockToastrService.error).toHaveBeenCalledTimes(1);
      });
      it('should not modify the values of allTasks and storedTasks', () => {
        let initialValue: Itask[] = [{ title: 'initialValue' }];
        tasksComponent.storedTasks.set(initialValue);
        tasksComponent.allTasks.set(initialValue);
        mockTaskService.getTasks.mockReturnValue(throwError(() => httpErrorResponse));
        fixture.detectChanges();
        expect(tasksComponent.allTasks()).toEqual(initialValue);
        expect(tasksComponent.storedTasks()).toEqual(initialValue);
      });
    });
  });
});
