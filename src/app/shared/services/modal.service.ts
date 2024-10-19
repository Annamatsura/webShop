import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CartType} from "../../../types/cart.type";
import {ServiceType} from "../../../types/service.type";
import {ModalFormType} from "../../../types/modal-form.type";
import {DefaultResponseType} from "../../../types/default-response.type";
@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private http: HttpClient) { }

  sendServiceRequest(name: string, phone: string, service?: ServiceType, type?: ModalFormType): Observable<DefaultResponseType> | undefined{
    if (type){
      if (service){
        return this.http.post<DefaultResponseType>(environment.api + "requests" , {
          name, phone, service, type
        });
      } else {
        return this.http.post<DefaultResponseType>(environment.api + "requests" , {
          name, phone, type
        });
      }
    } else return undefined
  }
}
