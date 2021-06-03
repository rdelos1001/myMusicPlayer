import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { HttpClientModule } from '@angular/common/http';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { Toast } from '@ionic-native/toast/ngx';

@NgModule({
  declarations: [
    AppComponent, 
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    File,
    FilePath,
    BackgroundMode,
    Diagnostic,
    NavigationBar,
    StatusBar,
    Toast,
    MusicControls,
    AppVersion,
    {
      provide: RouteReuseStrategy, useClass: IonicRouteStrategy
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
