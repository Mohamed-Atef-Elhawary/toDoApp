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
  modifyTasks: Mock;
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
      modifyTasks: vi.fn((tasks: Itask[]) => of(tasks)),
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
    tasks = [
      { title: 'task 1', id: '1' },
      { title: 'task 2', id: '2' },
      { title: 'task 3', id: '3' },
      { title: 'task 4', id: '4' },
      { title: 'task 5', id: '5' },
    ];
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
      mockTaskService.searchString$.next('task 1');
      expect(tasksComponent.allTasks()).toEqual([tasks[0]]);
    });
    it('should stop the emission after destroying', () => {
      mockTaskService.searchString$.next('task 1');
      expect(tasksComponent.allTasks()).toEqual([tasks[0]]);
      fixture.destroy();
      mockTaskService.searchString$.next('task 2');
      expect(tasksComponent.allTasks()).toEqual([tasks[0]]);
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
        let initialValue: Itask[] = [{ title: 'initialValue', id: '1' }];
        tasksComponent.storedTasks.set(initialValue);
        tasksComponent.allTasks.set(initialValue);
        mockTaskService.getTasks.mockReturnValue(throwError(() => httpErrorResponse));
        fixture.detectChanges();
        expect(tasksComponent.allTasks()).toEqual(initialValue);
        expect(tasksComponent.storedTasks()).toEqual(initialValue);
      });
    });
  });

  describe('Adding a new task', () => {
    it('should call taskService.modifyTasks() when newTaskTitle passes the regXp test', () => {
      const newTaskTitle: string = 'task 1';
      tasksComponent.onNewTask(newTaskTitle);
      expect(mockTaskService.modifyTasks).toHaveBeenCalledTimes(1);
    });
    it('should call toastr.error whith expected message  when newTaskTitle fails the regXp test', () => {
      const newTaskTitle: string = 't1';
      tasksComponent.onNewTask(newTaskTitle);
      expect(mockToastrService.error).toHaveBeenCalledTimes(1);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        "Task must follow the format 'task <number>'",
      );
    });

    it('should call taskService.modifyTasks() with array of new task title and id blus storedTasks', () => {
      const newTaskTitle: string = 'task 1';
      vi.spyOn(Date, 'now').mockReturnValue(123);
      const existingTasks = tasksComponent.storedTasks();
      tasksComponent.onNewTask(newTaskTitle);

      expect(mockTaskService.modifyTasks).toHaveBeenCalledTimes(1);
      expect(mockTaskService.modifyTasks).toHaveBeenCalledWith([
        { title: newTaskTitle, id: '123' },
        ...existingTasks,
      ]);
    });

    //   it('should call taskService.addTask() with array of new task title and id blus storedTasks', () => {
    //     const newTaskTitle: string = 'task 1';
    //     const existingTasks = tasksComponent.storedTasks();
    //     tasksComponent.onNewTask(newTaskTitle);
    //     expect(mockTaskService.modifyTasks).toHaveBeenCalledTimes(1);
    //     expect(mockTaskService.modifyTasks).toHaveBeenCalledWith([
    //       { title: newTaskTitle, id: expect.any(String) },
    //       ...existingTasks,
    //     ]);
    //   });

    describe('When API succeeds', () => {
      let newTaskTitle = 'task 6';
      let newMokedTask: Itask = { title: newTaskTitle, id: '6' };
      let storedTasks: Itask[];
      beforeEach(() => {
        storedTasks = [...tasks, newMokedTask];
        tasksComponent.storedTasks.set(tasks);
        mockTaskService.modifyTasks.mockReturnValue(of(storedTasks));
        fixture.detectChanges();
      });
      it('should update storedTasks with the newTask', () => {
        tasksComponent.onNewTask(newTaskTitle);
        expect(tasksComponent.storedTasks()).toEqual(storedTasks);
      });

      it('should reEmit taskService.searchString$ with the value', () => {
        mockTaskService.searchString$.next('task 1');
        tasksComponent.onNewTask(newTaskTitle);
        expect(tasksComponent.allTasks()).toEqual([tasks[0]]);
      });
      it('should call toastr.success', () => {
        tasksComponent.onNewTask(newTaskTitle);
        expect(mockToastrService.success).toHaveBeenCalledTimes(1);
        expect(mockToastrService.success).toHaveBeenCalledWith(
          'The task added successfully',
          'Success',
          SuccessConfig,
        );
      });
    });
    describe('When API fails', () => {
      let newTaskTitle = 'task 6';
      beforeEach(() => {
        mockTaskService.modifyTasks.mockReturnValue(throwError(() => httpErrorResponse));
        tasksComponent.storedTasks.set(tasks);
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
      it('should not update storedTasks', () => {
        expect(tasksComponent.storedTasks()).toEqual(tasks);
      });
    });
  });

  describe("Toggle task's isImportant", () => {
    let updatedTask: Itask;
    beforeEach(() => {
      updatedTask = { ...tasks[0], isImportant: true };
    });
    it("should toggle task's isImportant status in storedTasks", () => {
      tasksComponent.storedTasks.set(tasks);
      tasksComponent.onToggleImportant(updatedTask);
      expect(tasksComponent.storedTasks()[0].isImportant).toBe(true);
    });
    it('should call taskService.modifyTasks with the storedTasks', () => {
      tasksComponent.storedTasks.set(tasks);
      tasksComponent.onToggleImportant(updatedTask);
      expect(mockTaskService.modifyTasks).toHaveBeenCalledWith(tasksComponent.storedTasks());
    });
    it('should call taskService.modifyTasks once', () => {
      tasksComponent.storedTasks.set(tasks);
      tasksComponent.onToggleImportant(updatedTask);
      expect(mockTaskService.modifyTasks).toHaveBeenCalledTimes(1);
    });
    describe('When Api call succeeds', () => {
      beforeEach(() => {
        tasksComponent.storedTasks.set(tasks);
        mockTaskService.modifyTasks.mockReturnValue(of(tasks));
      });
      it('should set the allTasks with the tasks comming form AIP', () => {
        tasksComponent.onToggleImportant(updatedTask);
        expect(tasksComponent.allTasks()).toEqual(tasks);
      });
      it('should call toastr.success once', () => {
        tasksComponent.onToggleImportant(updatedTask);
        expect(mockToastrService.success).toHaveBeenCalledTimes(1);
      });
      it('should call toastr.success with the specified message', () => {
        tasksComponent.onToggleImportant(updatedTask);
        expect(mockToastrService.success).toHaveBeenCalledWith(
          'important status has been changed',
          'Success',
          SuccessConfig,
        );
      });
      it('should reEmit taskService.searchString$ with the same value', () => {
        let emissionErray: string[] = [];
        mockTaskService.searchString$.next('task 1');
        mockTaskService.searchString$.subscribe((value) => emissionErray.push(value));
        tasksComponent.onToggleImportant(updatedTask);
        expect(emissionErray.length).toBe(2);
        expect(emissionErray[0]).toBe(emissionErray[1]);
      });
      it('should refilter allTasks', () => {
        fixture.detectChanges();
        mockTaskService.searchString$.next('task 1');
        tasksComponent.onToggleImportant(updatedTask);
        expect(tasksComponent.allTasks()[0].title).toBe('task 1');
      });
    });

    describe('When Api call fails', () => {
      beforeEach(() => {
        mockTaskService.modifyTasks.mockReturnValue(throwError(() => httpErrorResponse));
        tasksComponent.storedTasks.set(tasks);
        tasksComponent.onToggleImportant(updatedTask);
      });
      it('should call toastr.error with specific message', () => {
        expect(mockToastrService.error).toHaveBeenCalledTimes(1);
        expect(mockToastrService.error).toHaveBeenCalledWith(
          httpErrorResponse.message,
          'Error',
          FailConfig,
        );
      });
      it('should reSet storedTasks with old tasks', () => {
        expect(tasksComponent.storedTasks()).toEqual(tasks);
      });
    });
  });

  describe("Toggle task's isComplete", () => {
    //     describe('If task.id is existing', () => {
    //       it('should call taskService.updateTask with the task id and toggled isComplete value', () => {
    //         tasks[0] = { ...tasks[0], id: '1' };
    //         tasksComponent.onToggleComplete(tasks[0]);
    //         expect(mockTaskService.updateTask).toHaveBeenCalledTimes(1);
    //         expect(mockTaskService.updateTask).toHaveBeenCalledWith(tasks[0].id, {
    //           isComplete: !tasks[0].isComplete,
    //         });
    //       });
    //       describe('When Api call succeeds', () => {
    //         beforeEach(() => {
    //           tasks[0] = { ...tasks[0], id: '1' };
    //           mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isComplete: true }));
    //           tasksComponent.allTasks.set(tasks);
    //           tasksComponent.onToggleComplete(tasks[0]);
    //         });
    //         it('should update the isComplete status of the specified task', () => {
    //           const modifiedTask: Itask = tasksComponent
    //             .allTasks()
    //             .find((task) => task.id === tasks[0].id)!;
    //           expect(modifiedTask).toEqual({ ...tasks[0], isComplete: true });
    //         });
    //         it('should not impact the other tasks', () => {
    //           const otherTasks: Itask[] = tasksComponent
    //             .allTasks()
    //             .filter((task) => task.id !== tasks[0].id);
    //           expect(otherTasks).toEqual(tasks.slice(1));
    //         });
    //       });
    //       describe('When Api call fails', () => {
    //         beforeEach(() => {
    //           tasks[0] = { ...tasks[0], id: '1' };
    //           mockTaskService.updateTask.mockReturnValue(throwError(() => httpErrorResponse));
    //           tasksComponent.allTasks.set(tasks);
    //           tasksComponent.onToggleComplete(tasks[0]);
    //         });
    //         it('should not update the allTasks', () => {
    //           expect(tasksComponent.allTasks()).toEqual(tasks);
    //         });
    //         it('should call toastr.error', () => {
    //           expect(mockToastrService.error).toHaveBeenCalledTimes(1);
    //           expect(mockToastrService.error).toHaveBeenCalledWith(
    //             httpErrorResponse.message,
    //             'Error',
    //             FailConfig,
    //           );
    //         });
    //       });
    //     });
    //     describe('If task.id is not existing', () => {
    //       it('should not update the allTasks', () => {
    //         mockTaskService.updateTask.mockReturnValue(of({ ...tasks[0], isComplete: true }));
    //         tasksComponent.allTasks.set(tasks);
    //         tasksComponent.onToggleComplete(tasks[0]);
    //         expect(tasksComponent.allTasks()).toEqual(tasks);
    //       });
    //     });
  });
});
