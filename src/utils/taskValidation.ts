// FIX incidencia 5: antes solo se miraba length > 0, entonces "   " (solo espacios)
// pasaba como titulo valido. Con trim() se sacan los espacios antes de validar.
export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0;
}
