import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableLogging, getLogger } from './util/logging';
import { axlHandshake } from './external/axl_integration';

if (environment.production) {
  enableProdMode();
}
if (environment.loggingEnabled) {
  enableLogging();
}

const logger = getLogger('EndangeredLanguageService');

platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  const { handshake } = axlHandshake()
  handshake
    .then(() => {
      console.log("AxL handshake Succeeded");
    })
    .catch(() => {
      alert("AxL handshake failed");
    })
})
.catch(err => logger.error(err));


