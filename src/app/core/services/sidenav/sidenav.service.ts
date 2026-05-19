import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidenavService {
    // Mantenuto per compatibilità con toolbar e altri componenti
    toggle() {}
    open() {}
    close() {}
}
