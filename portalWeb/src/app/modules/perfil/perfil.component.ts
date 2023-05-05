/// <reference  path="../../../../node_modules/@types/google.maps/index.d.ts"  />
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TokenService } from 'src/app/helper/token.service';
import { Colaborador, DocAdjunto } from 'src/app/models/cliente/colaborador';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { MantenimientoService } from 'src/app/services/mantenimiento.service';
import { map, Observable, of, startWith, Subject } from 'rxjs';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  EmailValidator,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CargoService } from 'src/app/services/cargo.service';
import { environment } from 'src/environments/environment';
import { GestionService } from 'src/app/helper/gestion.service';
import { Loader } from '@googlemaps/js-api-loader';
import { ApiService, Maps } from 'src/app/services/api.service';
import { DatosPersonalesService } from 'src/app/services/datos-personales.service';
import { ResponseModel } from 'src/app/models/response.model';
import { Familiar } from 'src/app/models/cliente/familiar';
import { format, startOfMonth } from 'date-fns';

// import { } from '@types/google.maps';
// declare var google:any;
const colors = [
  'red',
  'blue',
  'green',
  'yellow',
  'brown',
  'BurlyWood',
  'Cyan',
  'DarkGreen',
  'DarkOrchid',
  'DarkOliveGreen',
  'Fuchsia',
  'GoldenRod',
  'Indigo',
  'LightCoral',
  'MediumSlateBlue',
];
let colorIndex = 0;
const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  empleado!: Colaborador;
  cupo: any;
  familiares: Familiar[] = [];
  ctrlCorreo = new FormControl('' as any, [Validators.required,Validators.email]);
  ctrlTelefono = new FormControl(undefined as any, [Validators.required,Validators.maxLength(10),Validators.minLength(10)]);
  ctrlDireccion = new FormControl(undefined as any, Validators.required);
  urlimagen: string = '';
  urlimagenFamiliar: string = environment.apiImagenes;

  constructor(
    private mantenimientoService: MantenimientoService,
    private tokenService: TokenService,
    private datosService: DatosPersonalesService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private cargoService: CargoService,
    private toast: ToastrService,
    private gestionService: GestionService
  ) {}

  ngOnInit(): void {
    this.obtenerDatos();
    this.datosService.obtenerCupoCredito().subscribe((resp: ResponseModel) => {
      this.cupo = resp.data;
    });
  }

  open() {
    //console.log(colaborador.lstLocalidad);
    const dialogref = this.dialog.open(modalImagen, {
      data: { imagen: this.empleado.fotoPerfil },
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
        this.empleado.adjunto = adjunto;
      }
    });
  }

  consultarFamiliares() {
    this.datosService
      .obtenerFamiliares(this.empleado.id)
      .subscribe((resp: ResponseModel) => {
        this.familiares = resp.data;
        // this.familiares.forEach((e:Familiar)=>{
        //   e.fotoPerfil
        // });
        // console.log(this.familiares);
      });
  }

  obtenerDatos() {
    this.spinner.show();
    this.mantenimientoService
      .optenerColaboradores('', '', '', this.tokenService.getIdentificacion())
      .subscribe(
        (resp) => {
          this.empleado = resp.data[0];
          this.urlimagen =
            environment.apiImagenes + '' + this.empleado.fotoPerfil;
          this.ctrlTelefono.setValue(this.empleado.celular);
          this.ctrlDireccion.setValue(this.empleado.direccion);
          this.ctrlCorreo.setValue(this.empleado.correo);
          this.gestionService.guardaSuscriptorFoto(this.empleado.fotoPerfil);
          this.spinner.hide();
          this.consultarFamiliares();
        },
        () => {
          this.spinner.hide();
        }
      );
  }

  actualizarColaborador() {
    if(this.ctrlCorreo.valid&&this.ctrlDireccion.valid&&this.ctrlTelefono.valid){
      this.spinner.show();
    //console.log(this.empleado);
    this.cargoService
      .actualizarColaborador(
        this.empleado.id,
        this.ctrlTelefono.value,
        this.ctrlCorreo.value,
        this.ctrlDireccion.value,
        this.empleado.latitud,
        this.empleado.longitud,
        this.empleado.adjunto
      )
      .subscribe(
        (resp) => {
          if (resp.succeeded) {
            this.toast.success(resp.message);
            this.obtenerDatos();
          } else {
            this.toast.warning(resp.message);
          }
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
    }else{
      this.toast.warning('Datos Incorrectos');
      this.ctrlCorreo.markAllAsTouched();
      this.ctrlDireccion.markAllAsTouched();
      this.ctrlTelefono.markAllAsTouched();
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(modalMapa, {
      data: {
        latitud: this.empleado.latitud,
        longitud: this.empleado.longitud,
      },
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(result.latitud);
      if (result.latitud != undefined && result.longitud != undefined) {
        this.empleado.latitud = result.latitud;
        this.empleado.longitud = result.longitud;
      } else {
      }
      //console.log(this.latitud +' '+ this.longitud);
      if (
        this.empleado.latitud != undefined &&
        this.empleado.longitud != undefined
      ) {
      } else {
      }
    });
  }

  openFamiliar() {
    const dialogRef = this.dialog.open(modalFamiliar, {
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: true,
      data: {
        id: this.empleado.id,
        identificacion: this.empleado.cedula,
        accion: 'N',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(result.latitud);
      this.obtenerDatos();
    });
  }

  editarFamiliar(familiar: Familiar) {
    const dialogRef = this.dialog.open(modalFamiliar, {
      disableClose: true,
      autoFocus:false,
      closeOnNavigation:true,
      data: { familiar, accion: 'E' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(result.latitud);
      this.obtenerDatos();
    });
  }

  eliminarFamiliar(familiar: Familiar) {
    this.datosService
      .eliminarFamiliar(familiar.id, familiar.colaboradorId, true, true)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.toast.success(resp.message);
          this.obtenerDatos();
        } else {
          this.toast.warning(resp.message);
        }
      });
  }

  switch(familiar:Familiar){
    var habilitado = familiar.habilitado==false?true:false;
    this.datosService
      .eliminarFamiliar(familiar.id, familiar.colaboradorId, habilitado, false)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.toast.success(resp.message);
          this.obtenerDatos();
        } else {
          this.toast.warning(resp.message);
        }
      });
  }
}

@Component({
  selector: 'modalImagen',
  templateUrl: './modalImagen.html',
  styleUrls: ['./perfil.component.scss'],
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

  error:boolean=false;

  imagenvalida:boolean=false;

  constructor(
    private toast: ToastrService,
    public dialogRef: MatDialogRef<modalImagen>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private perfilService: DatosPersonalesService
  ) {}

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
    this.error=true;
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

    var base64: any = await this.convertBase64(file);
    //console.log(base64);
    this.imagenAdjunta = base64;

  }

  validarFoto(){
  this.perfilService.verificarImagen(this.croppedImage.split(',')[1],'imagen','png').subscribe((res:ResponseModel)=>{
      // console.log(res);
      if(res.succeeded){
        this.toast.success(res.message);
        this.imagenvalida=true;
      }else{
        this.toast.warning(res.message);
        this.imagenvalida=false;
      }
    })
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

@Component({
  selector: 'modalMapa',
  templateUrl: 'modalMapa.html',
  styleUrls: ['./perfil.component.scss'],
})
export class modalMapa implements OnInit {
  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<modalMapa>,
    private ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) {}
  marcadornuevo?: google.maps.Marker;
  markerahora?: google.maps.Marker;
  longitud: any = '';
  latitud: any = '';
  form!: FormGroup;
  formattedaddress = ' ';

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
      componentRestrictions: {country: "ec"}};
    let autocomplete = new maps.places.Autocomplete(
      this.searchElementRef.nativeElement,options
    );
    // console.log(autocomplete);

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceChange(autocomplete.getPlace());
      });
    });
  }

  // initMap(maps: Maps) {
  //   this.map = new maps.Map(this.mapElementRef.nativeElement, {
  //     zoom: 7,
  //   });
  //   this.map.addListener('click', (event:any) => {
  //     const ellipsePoints = toEllipse(this.entries[0].location.bounds);
  //     var line = turf.helpers.lineString(
  //       ellipsePoints.map((p) => [p.longitude, p.latitude])
  //     );

  //     const pointLatLng = event.latLng as google.maps.LatLng;
  //     var point = turf.helpers.point([pointLatLng.lng(), pointLatLng.lat()]);
  //   });
  // }

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
  selector: 'modalFamiliar',
  templateUrl: 'modalFamiliar.html',
  styleUrls: ['./perfil.component.scss'],
})
export class modalFamiliar implements OnInit {
  ctrlNombres = new FormControl('', [Validators.required,Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+( \s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*\s )*[ a-zA-ZÀ-ÿ\u00f1\u00d1]+$')]);
  ctrlApellidos = new FormControl('', [Validators.required,Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+( \s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*\s )*[ a-zA-ZÀ-ÿ\u00f1\u00d1]+$')]);
  ctrlIdentificacion = new FormControl('', [Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10)]);
  ctrlTelefono = new FormControl('', [Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10)]);
  ctrlCorreo = new FormControl('', [Validators.required,Validators.email]);
  ctrlAlias = new FormControl('', [Validators.required,Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+( \s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*\s )*[ a-zA-ZÀ-ÿ\u00f1\u00d1]+$')]);
  fechaDesdeIni: Date = new Date();
  ctrlDesde = new FormControl(this.fechaDesdeIni.toISOString(),
  Validators.required);
  ctrlHasta = new FormControl();
  ctrlCupo = new FormControl('',[
    Validators.required,
  Validators.pattern("^[0-9]*$"),
  ]);
  ctrlParentezco = new FormControl('', [Validators.required]);
  lsParentezco: Parentezco[] = [];
  filteredParentezco!: Observable<Parentezco[]>;
  idParentezco!: string;
  familiar!: Familiar;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<modalFamiliar>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personalservice: DatosPersonalesService
  ) {}
  ngOnInit() {
    this.consultarParentezco();
    if (this.data.familiar != undefined) {
      this.familiar = this.data.familiar;
      this.ctrlNombres.setValue(this.familiar.nombres);
      this.ctrlApellidos.setValue(this.familiar.apellidos);
      this.ctrlIdentificacion.setValue(this.familiar.identificacion);
      this.ctrlTelefono.setValue(this.familiar.celular);
      this.ctrlCorreo.setValue(this.familiar.correo);
      this.ctrlAlias.setValue(this.familiar.alias);
      this.ctrlDesde.setValue(this.familiar.fechaDesde.toString());
      this.ctrlHasta.setValue(this.familiar.fechaHasta.toString());
      this.ctrlCupo.setValue(this.familiar.cupo.toString());
      this.ctrlParentezco.setValue(this.familiar.tipoRelacionFamiliarDes);
      this.idParentezco = this.familiar.tipoRelacionFamiliarId;
    }
  }
  onSelectionPar(option: Parentezco, event: any) {
    if (event.isUserInput) {
      //console.log(option)
      this.idParentezco = option.id;
    }
  }
  consultarParentezco() {
    this.personalservice
      .obtenerParentezco()
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.lsParentezco = resp.data;

          // console.log(resp)
          this.filteredParentezco = this.ctrlParentezco.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterParentezco(value || ''))
          );
        }
      });
  }
  autorizarFamiliar() {
    // console.log(this.ctrlHasta.value+' - '+this.ctrlDesde.value!)
    if(this.ctrlHasta.value != null){
      this.ctrlHasta.setValue('2040-01-01T00:00:00.000Z');
    }
    if(new Date(this.ctrlHasta.value) >= new Date(this.ctrlDesde.value!)){
      if (
        this.ctrlNombres.valid &&
        this.ctrlApellidos.valid &&
        this.ctrlAlias.valid &&
        this.ctrlIdentificacion.valid &&
        this.ctrlTelefono.valid &&
        this.ctrlCorreo.valid &&
        this.ctrlCupo.valid &&
        this.ctrlDesde.valid &&
        this.ctrlParentezco.valid
      ) {
        this.personalservice
          .autorizarFamiliar(
            this.data.id,
            this.ctrlNombres.value!,
            this.ctrlApellidos.value!,
            this.ctrlAlias.value!,
            'C',
            this.ctrlIdentificacion.value!,
            this.ctrlTelefono.value!,
            this.ctrlCorreo.value!,
            true,
            this.ctrlCupo.value!,
            format(new Date(this.ctrlDesde.value!), 'yyyy-MM-dd'),
            format(new Date(this.ctrlHasta.value), 'yyyy-MM-dd'),
            this.idParentezco
          )
          .subscribe((resp: ResponseModel) => {
            if (resp.succeeded) {
              this.toast.success(resp.message);
              this.dialogRef.close();
            } else {
              this.toast.warning(resp.message);
            }
          });
      } else {
        this.ctrlNombres.markAllAsTouched();
        this.ctrlApellidos.markAllAsTouched();
        this.ctrlAlias.markAllAsTouched();
        this.ctrlIdentificacion.markAllAsTouched();
        this.ctrlTelefono.markAllAsTouched();
        this.ctrlCorreo.markAllAsTouched();
        this.ctrlCupo.markAllAsTouched();
        this.ctrlDesde.markAllAsTouched();
        this.ctrlParentezco.markAllAsTouched();
      }
    }else{
      this.toast.warning('La fecha fin debe ser mayor a la de inicio')
    }

  }

  editarFamiliar() {
    // console.log(new Date(this.ctrlHasta.value)+' - '+new Date(this.ctrlDesde.value!));

    if(new Date(this.ctrlHasta.value) >= new Date(this.ctrlDesde.value!)){
      if (
        this.ctrlNombres.valid &&
        this.ctrlApellidos.valid &&
        this.ctrlAlias.valid &&
        this.ctrlIdentificacion.valid &&
        this.ctrlTelefono.valid &&
        this.ctrlCorreo.valid &&
        this.ctrlCupo.valid &&
        this.ctrlDesde.valid &&
        this.ctrlParentezco.valid
      ){
        this.personalservice
        .editarFamiliar(
          this.familiar.id,
          this.familiar.colaboradorId,
          true,
          this.ctrlNombres.value!,
          this.ctrlApellidos.value!,
          this.ctrlAlias.value!,
          this.ctrlIdentificacion.value!,
          this.ctrlTelefono.value!,
          this.ctrlCorreo.value!,
          this.ctrlCupo.value!,
          format(new Date(this.ctrlDesde.value!), 'yyyy-MM-dd'),
          format(new Date(this.ctrlHasta.value), 'yyyy-MM-dd'),
          this.idParentezco
        )
        .subscribe((resp: ResponseModel) => {
          // console.log(resp);
          if (resp.succeeded) {
            this.toast.success(resp.message);
            this.dialogRef.close();
          } else {
            this.toast.warning(resp.message);
          }
        });
      }else {
        this.ctrlNombres.markAllAsTouched();
        this.ctrlApellidos.markAllAsTouched();
        this.ctrlAlias.markAllAsTouched();
        this.ctrlIdentificacion.markAllAsTouched();
        this.ctrlTelefono.markAllAsTouched();
        this.ctrlCorreo.markAllAsTouched();
        this.ctrlCupo.markAllAsTouched();
        this.ctrlDesde.markAllAsTouched();
        this.ctrlParentezco.markAllAsTouched();
      }
    }else{
      this.toast.warning('La fecha fin debe ser mayor a la de inicio')
    }

  }

  private _filterParentezco(value: string): Parentezco[] {
    const filterValue = value.toLowerCase();
    return this.lsParentezco.filter((option) =>
      option.nombre.toLowerCase().includes(filterValue)
    );
  }
}

export interface Parentezco {
  id: string;
  nombre: string;
}
