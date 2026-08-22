import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskInputComponent } from './task-input-component';
import { OutputRefSubscription } from '@angular/core';
import { Mock } from 'vitest';

describe('TaskInputComponent', () => {
  let fixture: ComponentFixture<TaskInputComponent>;
  let taskInputComponent: TaskInputComponent;
  let taskInputNative: HTMLElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(TaskInputComponent);

    taskInputComponent = fixture.componentInstance;

    taskInputNative = fixture.nativeElement as HTMLElement;
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
    let spyOnEmit: Mock;
    beforeEach(() => {
      spyOnEmit = vi.spyOn(taskInputComponent.newTask, 'emit');
    });
    it('should not emit when task is null', () => {
      taskInputComponent.task = null;
      taskInputComponent.onEnter();
      expect(spyOnEmit).not.toHaveBeenCalled();
    });
    it('should not emit when task is ""', () => {
      taskInputComponent.task = '';
      taskInputComponent.onEnter();
      expect(spyOnEmit).not.toHaveBeenCalled();
    });
    it('should not emit when task is " "', () => {
      taskInputComponent.task = ' ';
      taskInputComponent.onEnter();
      expect(spyOnEmit).not.toHaveBeenCalled();
    });
  });
  describe('regardless of the task value', () => {
    it('should set this.task to null', () => {
      taskInputComponent.task = 'task 1';
      taskInputComponent.onEnter();
      expect(taskInputComponent.task).toBeNull();
    });
  });

  describe('view to model interaction', () => {
    it('should update this.task when type into input', () => {
      fixture.detectChanges();
      let myInput = taskInputNative.querySelector('input')!;
      myInput.value = 'task 1';
      myInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
      fixture.detectChanges();
      expect(taskInputComponent.task).toBe(myInput.value);
    });
  });

  describe('model to view interaction', () => {
    it("should update the input's value when task value changed programmatically", async () => {
      taskInputComponent.task = 'task 1';
      await fixture.whenStable();
      fixture.detectChanges();
      const myInput: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(myInput.value).toBe('task 1');
    });
  });
  describe('onEnter call', () => {
    it('should call onEnter when keydown.enter triggered', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      const myInput: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const spyOnEnter = vi.spyOn(taskInputComponent, 'onEnter');
      myInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      expect(spyOnEnter).toHaveBeenCalledTimes(1);
    });
  });
});
