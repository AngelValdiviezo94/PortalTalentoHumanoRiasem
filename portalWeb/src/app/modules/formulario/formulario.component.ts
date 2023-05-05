/// <reference  path="../../../../node_modules/@types/google.maps/index.d.ts"  />
import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { WizardComponent } from 'angular-archwizard';
import { ToastrService } from 'ngx-toastr';
import { Prospecto } from 'src/app/models/prospecto/prospecto.model';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { Loader } from '@googlemaps/js-api-loader';
import { Observable, Subject, Subscriber } from 'rxjs';
import { Router } from '@angular/router';
import { CdTimerComponent, TimeInterface } from 'angular-cd-timer';
import { NgxSpinnerService } from 'ngx-spinner';
import { verificarCedula } from 'udv-ec';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { environment } from 'src/environments/environment';
import { format } from 'date-fns';
import { ApiService, Maps } from 'src/app/services/api.service';
import { DocAdjunto } from 'src/app/models/cliente/colaborador';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { DatosPersonalesService } from 'src/app/services/datos-personales.service';
import { ResponseModel } from 'src/app/models/response.model';

export interface DialogData {
  longitud: string;
  latitud: string;
}
declare var require: any;
const Swal = require('sweetalert2');

const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class FormularioComponent implements OnInit {
  @ViewChild(WizardComponent)
  public wizard!: WizardComponent;

  longitud!: string;
  latitud!: string;
  prospecto!: Prospecto;
  reenviar: boolean = true;
  //public wizard: WizardComponent | undefined;
  public valido: boolean = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;
  maxDate!: Date | any;

  //verticalform wizard
  detailForm!: FormGroup;
  contactForm!: FormGroup;
  paymentForm!: FormGroup;
  genero: string = '';
  model!: NgbDateStruct;

  //checkboxes variables
  tipoDocumento: string = 'c';
  minLengthDocumento: number = 10;
  maxLengthDocumento: number = 10;
  documentoValido: boolean = true;

  ocultar: boolean = true;
  ocultar1: boolean = true;

  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    numericInputMode: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  };

  minDateFechaNac: NgbDateStruct;
  maxDateFechaNac: NgbDateStruct;
  fechaNacimiento!: NgbDateStruct;

  urlimagen: any = 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icEditarFoto.png';
  adjunto!: DocAdjunto;

  @ViewChild('basicTimer', { static: true }) basicTimer!: CdTimerComponent;
  timerInfo = '';

  constructor(
    public prospectoservice: ProspectoService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    let fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() - 18);
    this.minDateFechaNac = { year: 1940, month: 1, day: 1 };
    this.maxDateFechaNac = { year: fecha.getFullYear(), month: fecha.getMonth() + 1, day: fecha.getDate() }
  }

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      identificacion: ['', [Validators.required]],
    });
    this.secondFormGroup = this.fb.group({
      otp: ['', [Validators.required]],
    });
    this.thirdFormGroup = this.fb.group({
      // fotoPerfil:['',Validators.required],
      fechaNacimiento: [''],
      // genero: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', Validators.compose([Validators.required, Validators.email])],
    });
    this.fourthFormGroup = this.fb.group(
      {
        contrasena: [
          '',
          Validators.compose([
            Validators.required,
            patternValidator(/\d/, { hasNumber: true }),
            patternValidator(/[A-Z]/, { hasCapitalCase: true }),
            patternValidator(/[a-z]/, { hasSmallCase: true }),
            patternValidator(RegExp('[\u0021-\u002b\u003c-\u0040]'), {
              hasSpecialCharacters: true,
            }),
            Validators.minLength(10),
          ]),
        ],
        confirmarcontrasena: [null, Validators.compose([Validators.required])],
      },
      {
        validator: passwordMatchValidator,
      }
    );
  }

  open() {
    const dialogref = this.dialog.open(modalImagen, {
      // data: { imagen: this.empleado.fotoPerfil },
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: true,
    });
    dialogref.afterClosed().subscribe((result) => {
      if (result == true) {
      } else {
        this.urlimagen = result.imagen;
        let adjunto: DocAdjunto = {
          base64: result.imagen.split(',')[1],
          nombre: 'FotoPerfil' + new Date().getTime(),
          extension: 'png',
        };
        // console.log(this.urlimagen);
        this.adjunto = adjunto;
      }
    });
  }

  finish(
    tipoIdentificacion: string,
    identificacion: string,
    direccion: string,
    email: string,
    password: string,
    dispositivoId: string
  ) {
    if (!this.fechaNacimiento) {
      this.toaster.warning('La fecha de nacimiento es requerida');
      return;
    }

    if (!this.genero) {
      this.toaster.warning('El género es requerido');
      return;
    }

    let fecha = this.ngbDateTimeToDate(this.fechaNacimiento);
    this.spinner.show();
    //console.log(tipoIdentificacion,identificacion,fechaNacimiento,genero,direccion,latitud,longitud,email,password,dispositivoId);
    this.prospectoservice
      .crearCliente(
        tipoIdentificacion,
        identificacion,
        format(fecha, 'yyyy-MM-dd'),
        this.genero,
        direccion,
        this.latitud.toString(),
        this.longitud.toString(),
        email,
        password,
        dispositivoId,
        this.adjunto
      )
      .subscribe((resp) => {
        if (resp.succeeded && resp.statusCode === '000') {
          //this.toaster.success('¡Genial'+this.prospecto.alias+'!, ya está activado tu servicio. Ahora podrás vivir experiencias memorables');
          // console.log('' + resp.data);
          //this.valido=true;
          Swal.fire({
            icon: 'success',
            title: this.prospecto.alias,
            text:
              'Te hemos enviado un correo electrónico a la dirección ' +
              email +
              ' con las instrucciones de activación del servicio.',
            confirmButtonColor: '#FE5A00',
          }).then((result: any) => {
            this.router.navigate(['/home']);
          });
        } else {
          this.toaster.error(resp.message);
          //this.valido=false;
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); this.toaster.error('No se pudo establecer la conexión'); });
  }

  myMethod(identificacion: string) {
    if (identificacion.length >= this.minLengthDocumento) {
      this.documentoValido = true;
      if (this.tipoDocumento === 'c' && !verificarCedula(identificacion)) {
        this.documentoValido = false;
        return;
      }
      this.spinner.show();
      this.prospectoservice
        .validarIdentificacion(this.tipoDocumento, identificacion)
        .subscribe(
          (resp) => {
            if (resp.succeeded && resp.statusCode === '000') {
              this.toaster.success('¡Genial! continúa al siguiente paso');
              this.prospecto = resp.data;
              // this.valido = true;
              this.valido = false;
              this.reenviar = false;
              this.wizard.navigation.goToStep(this.wizard, 1);
            } else {
              this.toaster.warning(resp.message);
              this.valido = false;
            }
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
    } else {
      this.valido = false;
    }
  }

  validarotp(value: any) {
    if (value.length == 6) {
      // console.log(value);
      this.prospectoservice
        .validarotp(value, this.prospecto?.identificacion)
        .subscribe((resp) => {
          //console.log(resp.body?.message);
          if (resp.succeeded == true) {
            this.toaster.success('¡Bienvenido ' + this.prospecto.alias + '!');
            // console.log('' + resp.data);
            this.thirdFormGroup.controls['correo'].setValue(
              this.prospecto.email
            );
            //this.valido = true;
            this.valido = false;
            this.wizard.navigation.goToStep(this.wizard, 2);
          } else {
            this.toaster.error('' + resp.message);
            this.valido = false;
          }
        });
    } else {
      this.valido = false;
    }
  }
  crearCliente() { }

  checkCedula() {
    this.tipoDocumento = 'c';
    this.minLengthDocumento = 10;
    this.maxLengthDocumento = 10;
    this.firstFormGroup.controls['identificacion'].setValue('');
  }

  checkPasaporte() {
    this.tipoDocumento = 'p';
    this.minLengthDocumento = 4;
    this.maxLengthDocumento = 16;
    this.firstFormGroup.controls['identificacion'].setValue('');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      data: { latitud: this.latitud, longitud: this.longitud },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(result.latitud);
      if (result.latitud != undefined && result.longitud != undefined) {
        this.latitud = result.latitud;
        this.longitud = result.longitud;
      } else {
      }
      //console.log(this.latitud +' '+ this.longitud);
      if (this.latitud != undefined && this.longitud != undefined) {
        this.valido = true;
      } else {
        this.valido = false;
      }
    });
  }

  onComplete(data: any) {
    data.elt.nativeElement.classList.add('muteCount');
    this.reenviar = true;
  }

  reenviarOtp() {
    this.spinner.show();
    this.prospectoservice
      .reenviarOtp(
        this.prospecto.email,
        this.prospecto.alias,
        this.prospecto.identificacion,
        this.prospecto.celular
      )
      .subscribe((resp) => {
        //console.log(resp.body?.message);
        if (resp.succeeded == true) {
          this.toaster.success('Se ha reenviado la OTP');
          this.reenviar = false;
          //console.log(resp.message);
          // console.log('' + resp.data);
        } else {
          this.toaster.error('' + resp.message);
          this.valido = false;
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  onTick(data: TimeInterface) {
    this.timerInfo = '';
  }

  onStart(data: any) {
    // console.log('Timer started.');
  }

  doActionBasicTimer(action: String) {
    switch (action) {
      case 'start':
        this.basicTimer.start();
        break;
      case 'resume':
        this.basicTimer.resume();
        break;
      case 'reset':
        this.basicTimer.reset();
        break;
      default:
        this.basicTimer.stop();
        break;
    }
  }

  mostrarPassword() {
    this.ocultar = !this.ocultar;
  }

  mostrarPassword1() {
    this.ocultar1 = !this.ocultar1;
  }

  selectGenero(event: any) {
    //console.log(event);
    this.genero = event;
  }

  ngbDateTimeToDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day, 0, 0, 0);
  }
}

export function patternValidator(
  regex: RegExp,
  error: ValidationErrors
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      // if control is empty return no error
      return null;
    }

    // test the value of the control against the regexp supplied
    const valid = regex.test(control.value);

    // if true, return no error (no error), else return error passed in the second parameter
    return valid ? null : error;
  };
}

export function passwordMatchValidator(control: AbstractControl) {
  const password: string = control.get('contrasena')!.value; // get password from our password form control
  const confirmPassword: string = control.get('confirmarcontrasena')!.value; // get password from our confirmPassword form control
  // compare is the password math
  if (password !== confirmPassword) {
    // if they don't match, set an error in our confirmPassword form control
    control.get('confirmarcontrasena')!.setErrors({ NoPassswordMatch: true });
  }
}
export interface DialogData {
  latitud: string;
  longitud: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  styleUrls: ['./formulario.component.scss'],
})
export class DialogOverviewExampleDialog implements OnInit {
  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    private ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) { }
  marcadornuevo?: google.maps.Marker;
  markerahora?: google.maps.Marker;
  longitud: any = '';
  latitud: any = '';
  form!: FormGroup;
  formattedaddress = ' ';;

  @ViewChild('map') mapElementRef: any;
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  public entries: any = [];

  public place!: google.maps.places.PlaceResult;

  public locationFields = [
    'name',
    'cityName',
    'stateCode',
    'countryName',
    'countryCode',
  ];

  private map!: google.maps.Map;
  ngOnInit(): void {
    this.apiService.api.then((maps) => {
      this.initAutocomplete(maps);
      this.loadMap();
    });
  }

  initAutocomplete(maps: Maps) {
    var options = {
      componentRestrictions: { country: "ec" }
    };
    let autocomplete = new maps.places.Autocomplete(
      this.searchElementRef.nativeElement, options
    );
    // console.log(autocomplete);

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceChange(autocomplete.getPlace());
      });
    });
  }

  onPlaceChange(place: google.maps.places.PlaceResult) {
    this.map.setCenter(place!.geometry!.location!);

    this.marcadornuevo?.setMap(null);
    this.marcadornuevo = new google.maps.Marker({
      position: place!.geometry!.location,
      animation: google.maps.Animation.DROP,
      map: this.map,
    });

    const location = this.locationFromPlace(place);
    this.latitud = location?.coordinates.latitude;
    this.longitud = location?.coordinates.longitude;
    // console.log(location);
  }

  remove(entry: any) {
    entry.marker.setMap(null);
    entry.rectangle.setMap(null);
    entry.expandedRectangle.setMap(null);
    entry.ellipse.setMap(null);
    this.entries = this.entries.filter((e: any) => e !== entry);
  }

  pin(color: any) {
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000',
      strokeWeight: 2,
      scale: 1,
    };
  }

  public locationFromPlace(place: google.maps.places.PlaceResult) {
    const components = place.address_components;
    if (components === undefined) {
      return null;
    }

    const areaLevel3 = getShort(components, 'administrative_area_level_3');
    const locality = getLong(components, 'locality');

    const cityName = locality || areaLevel3;
    const countryName = getLong(components, 'country');
    const countryCode = getShort(components, 'country');
    const stateCode = getShort(components, 'administrative_area_level_1');
    const name = place.name !== cityName ? place.name : null;

    const coordinates = {
      latitude: place.geometry!.location!.lat(),
      longitude: place.geometry!.location!.lng(),
    };

    const bounds = place.geometry!.viewport!.toJSON();

    // placeId is in place.place_id, if needed
    return {
      name,
      cityName,
      countryName,
      countryCode,
      stateCode,
      bounds,
      coordinates,
    };
  }

  loadMap() {
    let infoWindowL: google.maps.InfoWindow;
    let loader = new Loader({
      apiKey: environment.apiKeyGoogle,
      libraries: ['places'],
      language: 'es',
    });

    loader.load().then((google) => {
      //console.log('loaded gmaps');

      const location = { lat: -2.1410733213457394, lng: -79.93256128465931 };

      this.map = new google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          center: location,
          zoom: 15,
        }
      );
      const iconoactual = {
        url: '../assets/img/PIN POSICION MAP.png',
        scaledSize: new google.maps.Size(60, 60),
      };
      // const input = document.getElementById('pac-input') as HTMLInputElement;
      // const searchBox = new google.maps.places.SearchBox(input);
      // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 15,
          };
          if (
            this.data.latitud != '' &&
            this.data.latitud != undefined &&
            this.data.latitud != null
          ) {
            var marcador = {
              lat: Number(this.data.latitud),
              lng: Number(this.data.longitud),
              zoom: 15,
            };
            this.marcadornuevo = new google.maps.Marker({
              position: marcador,
              map: this.map,
              draggable: false,
              title: 'Nuevo Marcador',
            });
            this.latitud = this.marcadornuevo.getPosition()?.lat();
            this.longitud = this.marcadornuevo.getPosition()?.lng();
            this.marcadornuevo.addListener('rightclick', (e: any) => {
              this.marcadornuevo?.setMap(null);
              this.latitud = '';
              this.longitud = '';
            });
            this.map?.setCenter(marcador);
          } else {
            this.map?.setCenter(pos);
          }
          this.markerahora = new google.maps.Marker({
            position: pos,
            map: this.map,
            icon: iconoactual,
            animation: google.maps.Animation.BOUNCE,
          });

          this.map?.setZoom(15);
        },
        () => {
          this.handleLocationError(true, infoWindowL, this.map?.getCenter()!);
        }
      );

      // this.map.addListener(this.marker, 'click', this.showInfoWindow());
      this.map.addListener('click', (e: any) => {
        this.placeMarkerxAndPanTo(e.latLng);
      });
      infoWindowL = new google.maps.InfoWindow();
      const locationButton = document.createElement('button');

      locationButton.textContent = 'Ubicación';

      locationButton.classList.add('custom-map-control-button');

      locationButton.addEventListener('click', () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                zoom: 15,
              };
              const iconoactual = {
                url: '../assets/img/PIN POSICION MAP.png',
                scaledSize: new google.maps.Size(60, 60),
              };
              this.markerahora?.setMap(null);
              this.markerahora = new google.maps.Marker({
                position: pos,
                map: this.map,
                icon: iconoactual,
                animation: google.maps.Animation.BOUNCE,
              });
              infoWindowL.setPosition(pos);
              //infoWindowL.setContent('Te encuentras Aquí.');
              //infoWindowL.open(this.map);
              this.map?.setCenter(pos);
              this.map?.setZoom(15);
            },
            () => {
              this.handleLocationError(
                true,
                infoWindowL,
                this.map?.getCenter()!
              );
            }
          );
        } else {
          // Browser doesn't support Geolocation
          this.handleLocationError(false, infoWindowL, this.map?.getCenter()!);
        }
      });

      this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
        locationButton
      );
    });
  }

  handleLocationError(
    browserHasGeolocation: boolean,
    infoWindow: google.maps.InfoWindow,
    pos: google.maps.LatLng
  ) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? 'Error: The Geolocation service failed.'
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }
  placeMarkerxAndPanTo(latLng: google.maps.LatLng) {
    this.marcadornuevo?.setMap(null);
    this.marcadornuevo = new google.maps.Marker({
      position: latLng,
      map: this.map,
      draggable: false,
      title: 'Nuevo Marcador',
    });
    this.latitud = this.marcadornuevo.getPosition()?.lat();
    this.longitud = this.marcadornuevo.getPosition()?.lng();
    this.marcadornuevo.addListener('rightclick', (e: any) => {
      this.marcadornuevo?.setMap(null);
      this.latitud = '';
      this.longitud = '';
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  confirmarUbicacion() {
    if (this.latitud != '' && this.longitud != '') {
      this.form = this.fb.group({
        latitud: this.latitud,
        longitud: this.longitud,
      });
      this.dialogRef.close(this.form.value);
    } else {
      this.toast.warning('Seleccione la ubicación');
    }
  }
}

function getComponent(components: Components, name: string) {
  return components!.filter((component) => component.types[0] === name)[0];
}

function getLong(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.long_name;
}

function getShort(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.short_name;
}

@Component({
  selector: 'modalImagen',
  templateUrl: './modalImagenF.html',
  styleUrls: ['./formulario.component.scss'],
})
export class modalImagen implements OnInit {
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId!: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  form!: FormGroup;
  public errors: WebcamInitError[] = [];

  public webcamImage!: WebcamImage;

  private trigger: Subject<void> = new Subject<void>();

  private nextWebcam: Subject<boolean | string> = new Subject<
    boolean | string
  >();

  error: boolean = false;
  imagenvalida: boolean = false;

  constructor(
    private toast: ToastrService,
    public dialogRef: MatDialogRef<modalImagen>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private perfilService: DatosPersonalesService
  ) { }

  ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      }
    );
  }
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    this.error = true;
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    //console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.imagenAdjunta = this.webcamImage.imageAsDataUrl;
  }

  public cameraWasSwitched(deviceId: string): void {
    //console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  validarFoto() {
    this.perfilService.verificarImagen(this.croppedImage.split(',')[1], 'imagen', 'png').subscribe((res: ResponseModel) => {
      // console.log(res);
      if (res.succeeded) {
        this.toast.success(res.message);
        this.imagenvalida = true;
      } else {
        this.toast.warning(res.message);
        this.imagenvalida = false;
      }
    })
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imagenAdjunta: any;
  showCropper = false;

  async fileChangeEvent(event: any): Promise<void> {
    const file = event.target.files[0];

    const base64 = await this.convertBase64(file);
    //console.log(base64);
    this.imagenAdjunta = base64;
  }

  convertBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  imageCropped(event: any) {
    this.croppedImage = event.base64;
    this.validarFoto();
    //console.log(this.croppedImage);
  }
  imageLoaded() {
    this.showCropper = true;
    //console.log('Image loaded');
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  confirmarImagen() {
    if (this.croppedImage) {
      this.form = this.fb.group({
        imagen: this.croppedImage,
      });
      this.dialogRef.close(this.form.value);
    } else {
      this.toast.warning('Carga una imagen');
    }
  }
}
