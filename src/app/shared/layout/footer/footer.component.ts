import { Component, OnInit } from '@angular/core';
import {ModalFormType} from "../../../../types/modal-form.type";
import {FormBuilder, Validators} from "@angular/forms";
import {ModalService} from "../../services/modal.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  modalForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^([А-ЯЁ][а-яё]*)(s[А-ЯЁ][а-яё]*)*$/)]],
    phone: ['', [Validators.required]],
  });

  modalRequest: boolean = false;
  modalThanks: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private _snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  sendRequest(){
    if (this.modalForm.value.name && this.modalForm.value.phone){
      this.modalService.sendServiceRequest(this.modalForm.value.name,
        this.modalForm.value.phone, undefined, ModalFormType.consultation)?.
      subscribe( data => {
        let error = null;
        if (data.error){
          error = data.message;
          this._snackbar.open(error);
          throw new Error(error);
        }

        this.modalRequest = false;
        this.modalThanks = true;
      })
    }

  }

  closeModal(){
    this.modalRequest = false;
    this.modalThanks = false;
  }

  openModal(){
    this.modalForm.markAsUntouched();
    this.modalForm.markAsPristine();

    const paramsToUpdate = {
      name: '',
      phone: '',
    }

    this.modalForm.setValue(paramsToUpdate);

    this.modalRequest = true;
  }

}
