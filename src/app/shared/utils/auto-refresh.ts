import { Observable, fromEvent, interval, merge } from 'rxjs';
import { filter } from 'rxjs/operators';

/** L'utente sta scrivendo: ricaricare ora gli toglierebbe il fuoco dal campo. */
function isTyping(): boolean {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName ?? '');
}

/**
 * Emette quando è il momento di ricaricare una lista condivisa: ogni `periodMs` e al ritorno sulla
 * scheda, solo se la pagina è visibile, c'è rete e l'utente non sta scrivendo.
 */
export function autoRefresh(periodMs = 15000): Observable<unknown> {
  return merge(interval(periodMs), fromEvent(document, 'visibilitychange')).pipe(
    filter(() => document.visibilityState === 'visible' && navigator.onLine && !isTyping()),
  );
}
