import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private _http:HttpClient) { }
  language;
  language$=new EventEmitter()

  public loadSpanishLanguage(){
    return new Promise<any>(resolve =>{
      this._http.get<any>("assets/language/spanish.json").subscribe(resp=>{
       this.setActiveLanguage(resp);
        resolve(resp);
      })
    });
  }
  public loadEnglishLanguage(){
    return new Promise<any>(resolve =>{
      this._http.get<any>("assets/language/english.json").subscribe(resp=>{
       this.setActiveLanguage(resp);
        resolve(resp);
      })
    });
  }

  getActiveLanguage(){
    return this.language;
  }
  private setActiveLanguage(language){
    this.language=language;
    this.language$.emit();
  }
  getLanguage():string{
    return localStorage.getItem('language');
  }
  setLanguage(language:string):void{
    localStorage.setItem('language',language);
  }
}
