import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  templateUrl: './modal-form.component.html',
  styleUrl: './form-dialog.component.css',
})
export class FormDialogComponent {
  abierto = input.required<boolean>();
  titulo = input.required<string>();
  subtitulo = input('');
  etiqueta = input('CATÁLOGO ACADÉMICO');
  textoConfirmar = input('Guardar');
  guardando = input(false);
  error = input<string | null>(null);
  formId = input.required<string>();
  variante = input<'dialogo' | 'panel'>('dialogo');

  cerrar = output<void>();

  onBackdropClick(): void {
    if (this.variante() === 'panel') {
      this.cerrar.emit();
    }
  }

  onEscape(): void {
    if (this.variante() === 'panel') {
      this.cerrar.emit();
    }
  }
}