import { Injectable,Inject, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()

export class MyHttpInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log("intercept -> request : ", request);
    console.log("intercept -> HttpHandler : ", HttpHandler);

    const authReq = request.clone({ headers: request.headers.set("headerName", "headerValue")});
    
    return next
      .handle(request)
      .pipe(
        map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                console.log('XXXX MyHttpInterceptor ->intercept() / NEXT : event', event);
            }
            return event;
        })
    );

  }


}
