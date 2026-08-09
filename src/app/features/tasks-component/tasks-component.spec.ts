import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks-component';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task-service';
import { ToastrService } from 'ngx-toastr';
import { Itask } from '../../interfaces/task-interface';
import { Mock } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { FailConfig, SuccessConfig } from '../../config/toastr-config';
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
  let httpErrorResponse: HttpErrorResponse = new HttpErrorResponse({
    status: 500,
    statusText: 'server error',
  });
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

  it.skip('should create the app', () => {
    expect(tasksComponent).toBeTruthy();
  });

  describe.skip('Setting category from route param', () => {
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

  describe.skip('Filtering tasks by searchString', () => {
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

  describe.skip('Loading tasks at ngOnInit ', () => {
    describe('When API call succeeds', () => {
      it('should set tasks to allTasks and storedTasks', () => {
        mockTaskService.getTasks.mockReturnValue(of(tasks));
        fixture.detectChanges();
        expect(tasksComponent.allTasks()).toEqual(tasks);
        expect(tasksComponent.storedTasks()).toEqual(tasks);
      });
    });
    describe('When API call fails', () => {
      it('should call toastr.error with err.message and FailConfig', () => {
        mockTaskService.getTasks.mockReturnValue(throwError(() => httpErrorResponse));
        fixture.detectChanges();
        expect(mockToastrService.error).toHaveBeenCalledTimes(1);
        expect(mockToastrService.error).toHaveBeenCalledWith(
          httpErrorResponse.message,
          'Error',
          FailConfig,
        );
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

  describe.skip('Adding a new task', () => {
    it('should call taskService.addTask() with task title wrapped in object', () => {
      let newTaskTitle = 'new task';
      tasksComponent.onNewTask(newTaskTitle);
      expect(mockTaskService.addTask).toHaveBeenCalledTimes(1);
      expect(mockTaskService.addTask).toHaveBeenCalledWith({ title: newTaskTitle });
    });
    describe('When API succeeds', () => {
      let newTaskTitle = 'new task';
      let task: Itask = { title: newTaskTitle, id: 'newTaskId' };
      let allTasks: Itask[];
      beforeEach(() => {
        allTasks = [...tasks, task];
        tasksComponent.allTasks.set(tasks);
        mockTaskService.addTask.mockReturnValue(of(task));
        tasksComponent.onNewTask(newTaskTitle);
      });
      it('should update the allTasks with the newTask', () => {
        expect(tasksComponent.allTasks()).toEqual(allTasks);
      });
      it('should call toastr.success', () => {
        expect(mockToastrService.success).toHaveBeenCalledTimes(1);
        expect(mockToastrService.success).toHaveBeenCalledWith(
          'The task added successfully',
          'Success',
          SuccessConfig,
        );
      });
    });
    describe('When API fails', () => {
      let newTaskTitle = 'new task';
      beforeEach(() => {
        mockTaskService.addTask.mockReturnValue(throwError(() => httpErrorResponse));
        tasksComponent.allTasks.set(tasks);
        tasksComponent.onNewTask(newTaskTitle);
      });

      it('should call toastr.error', () => {
        expect(mockToastrService.error).toHaveBeenCalledTimes(1);
        expect(mockToastrService.error).toHaveBeenCalledWith(
          httpErrorResponse.message,
          'Error',
          FailConfig,
        );
      });
      it('should not update the allTasks', () => {
        expect(tasksComponent.allTasks()).toEqual(tasks);
      });
    });
  });

  describe.skip("Toggle task's isImportant", () => {
    describe('If task.id is existing', () => {
      it('should call taskService.updateTask with the task id and toggled isImportant value', () => {
        tasks[0] = { ...tasks[0], id: '1' };
        tasksComponent.onToggleImportant(tasks[0]);
        expect(mockTaskService.updateTask).toHaveBeenCalledTimes(1);
        expect(mockTaskService.updateTask).toHaveBeenCalledWith(tasks[0].id, {
          isImportant: !tasks[0].isImportant,
        });
      });
      describe('When Api call succeeds', () => {
        beforeEach(() => {
          tasks[0] = { ...tasks[0], id: '1' };
          mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isImportant: true }));
          tasksComponent.allTasks.set(tasks);

          tasksComponent.onToggleImportant(tasks[0]);
        });
        it('should update the isImportant status of the specified task', () => {
          const modifiedTask = tasksComponent
            .allTasks()
            .find((task: Itask) => task.id === tasks[0].id);
          expect(modifiedTask).toEqual({ ...tasks[0], isImportant: true });
        });
        it('should not impact the other tasks', () => {
          const otherTasks = tasksComponent
            .allTasks()
            .filter((task: Itask) => task.id !== tasks[0].id);
          expect(otherTasks).toEqual(tasks.slice(1));
        });
      });
      describe('When Api call fails', () => {
        beforeEach(() => {
          tasks[0] = { ...tasks[0], id: '1' };
          tasksComponent.allTasks.set(tasks);
          mockTaskService.updateTask.mockReturnValue(throwError(() => httpErrorResponse));
          tasksComponent.onToggleImportant(tasks[0]);
        });
        it('should not update the allTasks', () => {
          expect(tasksComponent.allTasks()).toEqual(tasks);
        });
        it('should call toastr.error', () => {
          expect(mockToastrService.error).toHaveBeenCalledTimes(1);
        });
      });
    });
    describe('If task.id is not existing', () => {
      it('should not update the allTasks', () => {
        tasksComponent.allTasks.set(tasks);
        mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isImportant: true }));
        tasksComponent.onToggleImportant(tasksComponent.allTasks()[0]);
        expect(tasksComponent.allTasks()).toEqual(tasks);
      });
    });
  });

  describe("Toggle task's isComplete", () => {
    describe('If task.id is existing', () => {
      it('should call taskService.updateTask with the task id and toggled isComplete value', () => {
        tasks[0] = { ...tasks[0], id: '1' };
        tasksComponent.onToggleComplete(tasks[0]);
        expect(mockTaskService.updateTask).toHaveBeenCalledTimes(1);
        expect(mockTaskService.updateTask).toHaveBeenCalledWith(tasks[0].id, {
          isComplete: !tasks[0].isComplete,
        });
      });
      describe('When Api call succeeds', () => {
        beforeEach(() => {
          tasks[0] = { ...tasks[0], id: '1' };
          mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isComplete: true }));
          tasksComponent.allTasks.set(tasks);
          tasksComponent.onToggleComplete(tasks[0]);
        });
        it('should update the isComplete status of the specified task', () => {
          const modifiedTask: Itask = tasksComponent
            .allTasks()
            .find((task) => task.id === tasks[0].id)!;
          expect(modifiedTask).toEqual({ ...tasks[0], isComplete: true });
        });
        it('should not impact the other tasks', () => {
          const otherTasks: Itask[] = tasksComponent
            .allTasks()
            .filter((task) => task.id !== tasks[0].id);
          expect(otherTasks).toEqual(tasks.slice(1));
        });
      });
      describe('When Api call fails', () => {
        beforeEach(() => {
          tasks[0] = { ...tasks[0], id: '1' };
          mockTaskService.updateTask.mockReturnValue(throwError(() => httpErrorResponse));

          tasksComponent.allTasks.set(tasks);
          tasksComponent.onToggleComplete(tasks[0]);
        });
        it('should not update the allTasks', () => {
          expect(tasksComponent.allTasks()).toEqual(tasks);
        });
        it('should call toastr.error', () => {
          expect(mockToastrService.error).toHaveBeenCalledTimes(1);
          expect(mockToastrService.error).toHaveBeenCalledWith(
            httpErrorResponse.message,
            'Error',
            FailConfig,
          );
        });
      });
    });
    describe('If task.id is not existing', () => {
      it('should not update the allTasks', () => {
        mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isComplete: true }));
        tasksComponent.allTasks.set(tasks);
        tasksComponent.onToggleComplete(tasks[0]);
        expect(tasksComponent.allTasks()).toEqual(tasks);
      });
    });
  });
});
