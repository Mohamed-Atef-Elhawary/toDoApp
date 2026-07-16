import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  retry,
  throwError,
  timer,
} from 'rxjs';
import { Itask } from '../interfaces/task-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  searchString$ = new BehaviorSubject('');
  constructor(private http: HttpClient) {}
  getTasks(): Observable<Itask[]> {
    return this.http.get<Itask[]>(environment.backendUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(() => throwError(() => new Error('please try again later'))),
    );
  }
  addTask(task: Itask): Observable<Itask> {
    return this.http.post<Itask>(environment.backendUrl, task).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(() => throwError(() => new Error('please try again later'))),
    );
  }

  deleteTask(id: string): Observable<Itask> {
    return this.http.delete<Itask>(`${environment.backendUrl}/${id}`).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(() => throwError(() => new Error('please try again later'))),
    );
  }

  updateTask(id: string, changes: Partial<Itask>): Observable<Itask> {
    return this.http
      .patch<Itask>(`${environment.backendUrl}/${id}`, changes)
      .pipe(catchError(() => throwError(() => new Error('please try again later'))));
  }
}
