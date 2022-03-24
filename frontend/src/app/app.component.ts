import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public translate: TranslateService
  ){
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');
    translate.use('fr');
  }
  title = 'frontend';

  switchLang(lang: string) {
    this.translate.use(lang);
  }
}
