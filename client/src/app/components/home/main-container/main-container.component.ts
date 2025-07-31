import { Component } from '@angular/core';
import { XepHangComponent } from "./xep-hang/xep-hang.component";
import { PhimBoComponent } from "./phim-bo/phim-bo.component";
import { PhimLeComponent } from "./phim-le/phim-le.component";
import { PhimMoiComponent } from "./phim-moi/phim-moi.component";
import { XemChuaXongComponent } from "./xem-chua-xong/xem-chua-xong.component";
import { MyListComponent } from "./my-list/my-list.component";

@Component({
  selector: 'app-main-container',
  standalone: true,
  imports: [XepHangComponent, PhimBoComponent, PhimLeComponent, PhimMoiComponent, XemChuaXongComponent, MyListComponent],
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.css'
})
export class MainContainerComponent {

}
