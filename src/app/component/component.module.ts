import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentPage } from './component.page';

import { ComponentPageRoutingModule } from './component-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentPageRoutingModule
  ],
  declarations: [ComponentPage]
})
export class ComponentPageModule {}
