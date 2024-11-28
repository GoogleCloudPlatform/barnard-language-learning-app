import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableLogging, getLogger } from './util/logging';
// import { axlHandshake } from './external/axl_integration';

if (environment.production) {
  enableProdMode();
}
if (environment.loggingEnabled) {
  enableLogging();
}

const logger = getLogger('EndangeredLanguageService');

// const { handshake } = axlHandshake()
// handshake
//   .then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => logger.error(err));
  // })
  // .catch(() => {
  //   alert("AxL handshake failed");
  // })
