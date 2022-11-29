import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PathService {

  isPath(string: String) {
    return location.pathname === "/signin";
  };

}