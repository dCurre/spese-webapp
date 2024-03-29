import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { TablesEnum } from 'src/app/enums/tablesEnum';
import { Constants } from './constants';

@Injectable({
    providedIn: 'root'
})

export class ConstantsService {

    private collection = this.db.collection<Constants>(TablesEnum.CONSTANTS);

    constructor(private db: AngularFirestore) { }

    getConstants() {
        return this.collection.valueChanges().pipe(map(constants => {
            console.debug("ConstantsService.getConstants", constants[0])
            return constants[0];
        }));

    }

}