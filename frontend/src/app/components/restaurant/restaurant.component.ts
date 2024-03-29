import { Component, OnInit } from '@angular/core';
import { RestaurantService } from 'src/app/service/restaurant.service';
import { Restaurant } from 'src/model/restaurant';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {

  restaurants?: Restaurant[];
  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.retrieveRestaurants();
  }

  retrieveRestaurants(): void{
    this.restaurantService.getRestaurants()
    .subscribe({
      next: (data) => {
        this.restaurants = data;
        console.log(data);
      },
      error: (e) => console.error(e)
    });
  }

}
