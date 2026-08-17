import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks-component';
import { DebugElement, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task-service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, of } from 'rxjs';
import { Mock } from 'vitest';
import { By } from '@angular/platform-browser';
import { PageTitleComponent } from '../components/page-title-component/page-title-component';
import { TaskInputComponent } from '../components/task-input-component/task-input-component';
import { Itask } from '../../interfaces/task-interface';
import { TaskItemComponent } from '../components/task-item-component/task-item-component';
import { MockTaskService } from './tasks-component.spec';

describe('TasksComponent Dom ', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let tasksDebugElement: DebugElement;
  let tasksComponent: TasksComponent;
  let mockActivatedRoute: any;
  let mockTaskService: MockTaskService;
  let tasks: Itask[];
  beforeEach(() => {
    let spyActivatedRoute = { paramMap: of({ get: vi.fn((category) => '') }) };
    let spyTaskService: MockTaskService = {
      searchString$: new BehaviorSubject<string>(''),
      getTasks: vi.fn(() => of([])),
      modifyTasks: vi.fn(() => of([])),
    };
    let spyToastrService = { error: vi.fn(), success: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: spyActivatedRoute },
        { provide: TaskService, useValue: spyTaskService },
        { provide: ToastrService, useValue: spyToastrService },
        DestroyRef,
      ],
    });
    fixture = TestBed.createComponent(TasksComponent);
    tasksDebugElement = fixture.debugElement;
    tasksComponent = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute);
    mockTaskService = TestBed.inject(TaskService) as unknown as MockTaskService;
    tasks = [
      { title: 'task 1', id: '1' },
      { title: 'task 2', id: '2' },
      { title: 'task 3', id: '3' },
      { title: 'task 4', id: '4' },
      { title: 'task 5', id: '5' },
    ];
  });

  it('should bind the category to page-title-component', () => {
    mockActivatedRoute.paramMap = of({ get: vi.fn((category) => 'important') });
    fixture.detectChanges();
    const pageTitleComponentDebug: DebugElement = tasksDebugElement.query(
      By.directive(PageTitleComponent),
    );

    expect((pageTitleComponentDebug.componentInstance as PageTitleComponent).category()).toBe(
      'important',
    );
  });

  describe("when category is 'all'", () => {
    let taskInputComponentDebug: DebugElement;

    beforeEach(() => {
      mockActivatedRoute.paramMap = of({ get: vi.fn((category) => '') });
      fixture.detectChanges();
      taskInputComponentDebug = tasksDebugElement.query(By.directive(TaskInputComponent));
    });
    it('should render task-input-component', () => {
      expect(taskInputComponentDebug).toBeTruthy();
    });
    it('should call onNewTask with the emitted newTask value', () => {
      const taskInputComponent: TaskInputComponent =
        taskInputComponentDebug.componentInstance as TaskInputComponent;
      const spyOnNewTask = vi.spyOn(tasksComponent, 'onNewTask');
      taskInputComponent.newTask.emit('task 1');
      expect(spyOnNewTask).toHaveBeenCalledWith('task 1');
      expect(spyOnNewTask).toHaveBeenCalledTimes(1);
    });
  });
  describe("when category is not 'all'", () => {
    it('should not render task-input-component', () => {
      mockActivatedRoute.paramMap = of({ get: vi.fn((category) => 'important') });
      fixture.detectChanges();
      const taskInputComponentDebug: DebugElement = tasksDebugElement.query(
        By.directive(TaskInputComponent),
      );
      expect(taskInputComponentDebug).toBe(null);
    });
  });

  describe('task-item-component', () => {
    let taskItemComponentDebug: DebugElement;
    let taskItemComponent: TaskItemComponent;
    beforeEach(() => {
      mockActivatedRoute.paramMap = of({ get: vi.fn((category) => '') });
      mockTaskService.getTasks.mockReturnValue(of(tasks));
      fixture.detectChanges();
      taskItemComponentDebug = tasksDebugElement.query(By.directive(TaskItemComponent));
      taskItemComponent = taskItemComponentDebug.componentInstance;

      vi.spyOn(tasksComponent, 'onToggleImportant');
      vi.spyOn(tasksComponent, 'onToggleComplete');
      vi.spyOn(tasksComponent, 'onDelete');
    });
    it('should pass specificTasks to task-item-component as allTasks', () => {
      expect(taskItemComponent.allTasks()).toEqual(tasks);
    });
    it('should call onToggleImportant with the emitted task', () => {
      taskItemComponent.toggleImportant.emit(tasks[0]);
      expect(tasksComponent.onToggleImportant).toHaveBeenCalledWith(tasks[0]);
    });
    it('should call onToggleComplete with the emitted task', () => {
      taskItemComponent.toggleComplete.emit(tasks[0]);
      expect(tasksComponent.onToggleComplete).toHaveBeenCalledWith(tasks[0]);
    });
    it('should call onDelete with the emitted task', () => {
      taskItemComponent.delete.emit(tasks[0]);
      expect(tasksComponent.onDelete).toHaveBeenCalledWith(tasks[0]);
    });
  });
});
