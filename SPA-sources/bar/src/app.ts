import { autoinject, PLATFORM } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { Router, RouterConfiguration } from 'aurelia-router';

declare const __webpack_public_path__: string;

@autoinject
export class App {
  private router: Router;
  private hostingURL: string;
  public constructor(
    public readonly i18n: I18N,
  ) {
    this.hostingURL = new URL(document.baseURI).origin;
  }
  public configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'bar';
    config.options.pushState = true;
    config.options.root = __webpack_public_path__;
    config
      .map([
        {
          route: '', redirect: 'page-one'
        },
        {
          moduleId: PLATFORM.moduleName('page-one/page-one'),
          name: 'page-one',
          nav: true,
          route: 'page-one',
          title: 'one'
        },
        {
          moduleId: PLATFORM.moduleName('page-two/page-two'),
          name: 'page-two',
          nav: true,
          route: 'page-two',
          title: 'two'
        },
      ]);
  }

  public async setLocale(event: Event, locale: 'en' | 'de') {
    event.stopPropagation();
    event.preventDefault();
    
    await this.i18n.setLocale(locale);
  }
}
