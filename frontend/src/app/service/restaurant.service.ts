import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Restaurant } from 'src/model/restaurant';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  baseUri: string = environment.apiUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient) { }
  // CREATE
  createRestaurant(data: Restaurant): Observable<any> {
    let url = `${this.baseUri}/restaurant`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt));
  }
  // GET ALL
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUri}/restaurant`);
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
