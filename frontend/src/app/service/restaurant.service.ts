import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Restaurant } from 'src/model/restaurant';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  baseUri: string = environment.apiUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient,
    private cookie: CookieService,
    private logger: LogService) { }
  // CREATE
  createRestaurant(data: Restaurant): Observable<any> {
    let url = `${this.baseUri}/restaurant`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt));
  }
  // GET ALL
  getRestaurants(): Observable<{ message: string, number: Number, restaurants: any }> {
    const token = this.cookie.get('_RequestAntiForgeryToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    return this.http.get<{ message: string, number: Number, restaurants: any }>(`${this.baseUri}/restaurant`, { headers: headers });
  }
  // GET ONE
  getRestaurant(id: string): Observable<Restaurant[]> {
    let url = `${this.baseUri}/restaurant/${id}`;
    return this.http
      .get(url, { headers: this.headers })
      .pipe(
        map((res: any) => {
          return res || {};
        }),
        catchError(this.errorMgmt)
      );
  }
  // UPDATE
  updateRestaurant(id: string, data: any): Observable<any> {
    let url = `${this.baseUri}/restaurant/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
