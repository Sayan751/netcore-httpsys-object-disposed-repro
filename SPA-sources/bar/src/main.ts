import { Aurelia } from 'aurelia-framework';
import { I18N, TCustomAttribute } from 'aurelia-i18n';
import { PLATFORM } from 'aurelia-pal';
import Fetch from 'i18next-fetch-backend';
import environment from '../config/environment.json';
import '../static/app.css';

declare const __webpack_public_path__: string;
export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .plugin(PLATFORM.moduleName('aurelia-i18n'), (i18n: I18N) => {
      const aliases = ['t', 'i18n'];
      TCustomAttribute.configureAliases(aliases);
      i18n.i18next
        .use(Fetch);
      return i18n.setup({
        lng: 'en',
        fallbackLng: 'en',
        defaultNS: 'translation',
        attributes: aliases,
        backend: {
          loadPath: `${__webpack_public_path__}locales/{{lng}}.json`,
        },
        debug: false,
      });
    });


  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
