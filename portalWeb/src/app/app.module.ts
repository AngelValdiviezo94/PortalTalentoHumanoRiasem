import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToobarComponent } from './components/toobar/toobar.component';
import { FormularioModule } from './modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptorService } from './helper/auth.interceptor';
import { NgxSpinnerModule } from "ngx-spinner";
import { MaterialExampleModule } from './material.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerI18n, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomDatepickerI18n, I18n } from './helper/custom-datepicker-I18n';
import { CustomAdapterNgbDatePicker } from './helper/custom-adapter-ngbdatepicker';
import { CustomDateParserFormatterNgbDatePicker } from './helper/custom-date-parser-formatter-ngbdatepicker';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToobarComponent,
    HttpClientModule,
    FormularioModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    NgxSpinnerModule,
    MaterialExampleModule,
    NgbModule,
    PerfectScrollbarModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatterNgbDatePicker },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
