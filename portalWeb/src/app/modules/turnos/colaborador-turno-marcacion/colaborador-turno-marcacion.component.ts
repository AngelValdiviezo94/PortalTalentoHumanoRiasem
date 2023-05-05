import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation, AfterViewInit, Input, Inject } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MarcacionColaborador } from 'src/app/models/marcaciones/marcacion-recursos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-colaborador-turno-marcacion',
  templateUrl: './colaborador-turno-marcacion.component.html',
  styleUrls: ['./colaborador-turno-marcacion.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None
})
export class ColaboradorTurnoMarcacionComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() eventCloseModal: EventEmitter<any> = new EventEmitter();

  dataGrid!: MatTableDataSource<any>;
  columnasGrid = ['colaborador', 'identificacion', 'hTotalAsignadas', 'hTotalTrabajadas', 'hTotalPendiente'];
  columnsToDisplayWithExpand = [...this.columnasGrid, 'expand'];
  expandedElement!: any | null;
  pageSize: number;

  constructor(@Inject(MAT_DIALOG_DATA) public infoGrid: MarcacionColaborador[], public dialog: MatDialog) {
    this.pageSize = 10;

    // this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    // this.paginator._intl.nextPageLabel = 'Siguiente página';
    // this.paginator._intl.previousPageLabel = 'Página anterior';
    // this.paginator._intl.lastPageLabel = 'Última página';
    // this.paginator._intl.firstPageLabel = 'Primera página';

    this.dataGrid = new MatTableDataSource<any>(infoGrid);
    this.dataGrid.sort = this.sort;
    this.dataGrid.paginator = this.paginator;
  }

  ngOnInit(): void { }

  ngAfterViewInit() { }

  closeModal() {
    this.eventCloseModal.emit();
    this.dialog.closeAll();
  }

  RetornaNombreDia(fecha: string) {
    return format(new Date(fecha), 'EEEE', { locale: es });
  }
}
