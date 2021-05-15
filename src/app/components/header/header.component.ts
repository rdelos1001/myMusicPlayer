import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input()title:string;
  @Input()back:boolean=false;
  @Input()settings:boolean=false;
  constructor(private router:Router) { }

  ngOnInit() {}
  navigate(path:string){
    this.router.navigate([path]);
  }
}
