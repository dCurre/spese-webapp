import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Constants } from './constants';
import { TablesEnum } from 'src/app/shared/enums/tablesEnum';

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