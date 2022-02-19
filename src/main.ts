import { getCachedAccessToken } from './helpers/matrix-helper';
import { defineCustomElement } from 'vue';
import appRegister from './app-register';
import Toguro from './Toguro.ce.vue';
import { LoginUpdateEvent } from './helpers/app-events';

// If you change this line, your app might not be registered properly
const ToguroVueComponent = defineCustomElement(Toguro);

// this has to be your final line
appRegister(ToguroVueComponent);

getCachedAccessToken().then((value) => {
  if (value) {
    window.dispatchEvent(LoginUpdateEvent(value));
  }
});
