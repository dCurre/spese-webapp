import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PathService {

  isPath(string: String) {
    console.debug("PATH: " + location.pathname)
    return location.pathname === string;
  };

}