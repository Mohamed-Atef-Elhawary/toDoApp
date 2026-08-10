import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { Ibins, Itask } from '../interfaces/task-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  searchString$ = new BehaviorSubject('');
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Itask[]> {
    return this.http
      .get<Ibins>(`${environment.backendUrl}/${environment.binId}`, {
        headers: new HttpHeaders({ 'X-Master-Key': environment.masterKey }),
      })
      .pipe(
        retry({ count: 1, delay: 1000 }),
        map((response: Ibins) => {
          console.log('from map', response);
          return response['record']['tasks'];
        }),
        catchError(() => throwError(() => new Error('please try again later'))),
      );
  }

  modifyTasks(tasks: Itask[]): Observable<Itask[]> {
    return this.http
      .put<Ibins>(
        `${environment.backendUrl}/${environment.binId}`,
        { tasks },
        {
          headers: new HttpHeaders({
            'X-Master-Key': environment.masterKey,
          }),
        },
      )
      .pipe(
        retry({ count: 1, delay: 1000 }),
        map((response: Ibins) => {
          console.log('response ', response);
          return response['record']['tasks'];
        }),
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
    return this.http.patch<Itask>(`${environment.backendUrl}/${id}`, changes).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(() => throwError(() => new Error('please try again later'))),
    );
  }
}
