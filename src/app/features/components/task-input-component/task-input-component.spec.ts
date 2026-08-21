import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskInputComponent } from './task-input-component';
import { OutputRefSubscription } from '@angular/core';

describe('TaskInputComponent', () => {
  let fixture: ComponentFixture<TaskInputComponent>;
  let taskInputComponent: TaskInputComponent;
  beforeEach(async () => {
    TestBed.configureTestingModule({}).compileComponents();
    fixture = TestBed.createComponent(TaskInputComponent);
    taskInputComponent = fixture.componentInstance;
  });
  it('should create', () => {
    expect(taskInputComponent).toBeTruthy();
  });

  describe('when task has meaningful value', () => {
    let newTask: string = '';

    it('should emit the trimmed value', () => {
      newTask = ' task 1 ';
      taskInputComponent.task = newTask;
      let myEmittedTask: string = '';
      const subscription: OutputRefSubscription = taskInputComponent.newTask.subscribe(
        (emittedTask: string) => {
          myEmittedTask = emittedTask;
        },
      );
      taskInputComponent.onEnter();
      expect(myEmittedTask).toBe(newTask.trim());
      subscription.unsubscribe();
    });
  });
  describe('when task is "","  ",null', () => {
    it('should not emit when task is null', () => {
      taskInputComponent.task = null;
      const spyOnEmit = vi.spyOn(taskInputComponent.newTask, 'emit');
      taskInputComponent.onEnter();
      expect(spyOnEmit).not.toHaveBeenCalled();
    });
    it('should not emit when task is ""', () => {});
    it('should not emit when task is " "', () => {});
  });
  describe('regardless of the task value', () => {
    it('should set this.task to null', () => {});
  });
});
