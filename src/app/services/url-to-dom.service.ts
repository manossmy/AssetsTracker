import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class URLToDomService {

    constructor(private httpService: HTTPService) { }

    async getDom(url: string) {
        return new DOMParser()
        .parseFromString((await this.httpService.get(url, {})).data, 'text/html');
    }
}