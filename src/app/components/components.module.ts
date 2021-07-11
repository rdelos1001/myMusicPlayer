import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { ReorderPlayListComponent } from './reorder-play-list/reorder-play-list.component';
import { IonicModule } from '@ionic/angular';
import { SongPlayerComponent } from './song-player/song-player.component';
import { ViewEditPlaylistComponent } from './view-edit-playlist/view-edit-playlist.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ReorderPlayListComponent,
    SongPlayerComponent,
    ViewEditPlaylistComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[
    HeaderComponent,
    ReorderPlayListComponent,
    SongPlayerComponent,
    ViewEditPlaylistComponent
  ]
})
export class ComponentsModule { }
