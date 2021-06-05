import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { ViewPlayListComponent } from './view-play-list/view-play-list.component';
import { IonicModule } from '@ionic/angular';
import { SongPlayerComponent } from './song-player/song-player.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ViewPlayListComponent,
    SongPlayerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[
    HeaderComponent,
    ViewPlayListComponent,
    SongPlayerComponent
  ]
})
export class ComponentsModule { }
