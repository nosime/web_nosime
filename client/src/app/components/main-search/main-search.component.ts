import { Component } from '@angular/core';
import { SearchResultComponent } from "./search-result/search-result.component";


@Component({
  selector: 'app-main-search',
  standalone: true,
  imports: [SearchResultComponent],
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.css'
})
export class MainSearchComponent {

}
