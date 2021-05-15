import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SongsPageRoutingModule } from './songs-routing.module';

import { SongsPage } from './songs.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SongsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SongsPage]
})
export class SongsPageModule {}
