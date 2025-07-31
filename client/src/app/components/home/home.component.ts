import { Component } from '@angular/core';
import { SliderComponent } from "./slider/slider.component";
import { MainContainerComponent } from "./main-container/main-container.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SliderComponent, MainContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
