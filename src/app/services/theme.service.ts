import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  renderer:Renderer2
  LIGHT_THEME="light-theme";
  DARK_THEME="dark-theme";
  constructor(private rendererFactory:RendererFactory2,@Inject(DOCUMENT) private document:Document) {
    this.renderer=this.rendererFactory.createRenderer(null,null);
   }

  getColorStr():string{
    var regex = new RegExp('dark-theme');

    if(regex.test(this.document.body.className)){
      return 'success';
    }
    return 'danger';
  }
  isDarkModeEnable(){
    var regex = new RegExp('dark-theme');
    return regex.test(this.document.body.className);
  }
  private enableDark(){
    this.renderer.removeClass(this.document.body,'light-theme');
    this.renderer.addClass(this.document.body,'dark-theme');
  }
  private enableLight(){
    this.renderer.removeClass(this.document.body,'dark-theme');
    this.renderer.addClass(this.document.body,'light-theme');
  }
  getTheme():string{
    return localStorage.getItem("theme");
  }
  setTheme(theme:string){
    localStorage.setItem("theme",theme);
    if(theme===this.DARK_THEME){
      this.enableDark();
    }else{
      this.enableLight();
    }
  }
}