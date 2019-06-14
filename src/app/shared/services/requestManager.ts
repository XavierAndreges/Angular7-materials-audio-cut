import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';

@Injectable()

export class RequestManager {

  
  constructor(
    public http: HttpClient
  ) { }

  //https://github.com/Fairen/seed-crud-service/blob/master/lib/crud.service.ts 


  public loadFileAsArrayBuffer(filePath: string): Observable<ArrayBuffer> {  
    const httpOptions: Object = {
        responseType: 'arrayBuffer'
      }; 
    return this.http.get<ArrayBuffer>(filePath, httpOptions);
  }


}
