import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GojsAngularModule } from 'gojs-angular';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { InspectorComponent } from './inspector/inspector.component';
import { InspectorRowComponent } from './inspector/inspector-row.component';



@NgModule({
  declarations: [
    AppComponent,
    InspectorComponent,
    InspectorRowComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    GojsAngularModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
