<template>
  <div ref="root" class="login-mx">
    <div class="left">
      <svg
        enable-background="new 0 0 300 302.5"
        version="1.1"
        viewBox="0 0 300 302.5"
        xml:space="preserve"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          class="st0"
          d="m126 302.2c-2.3 0.7-5.7 0.2-7.7-1.2l-105-71.6c-2-1.3-3.7-4.4-3.9-6.7l-9.4-126.7c-0.2-2.4 1.1-5.6 2.8-7.2l93.2-86.4c1.7-1.6 5.1-2.6 7.4-2.3l125.6 18.9c2.3 0.4 5.2 2.3 6.4 4.4l63.5 110.1c1.2 2 1.4 5.5 0.6 7.7l-46.4 118.3c-0.9 2.2-3.4 4.6-5.7 5.3l-121.4 37.4zm63.4-102.7c2.3-0.7 4.8-3.1 5.7-5.3l19.9-50.8c0.9-2.2 0.6-5.7-0.6-7.7l-27.3-47.3c-1.2-2-4.1-4-6.4-4.4l-53.9-8c-2.3-0.4-5.7 0.7-7.4 2.3l-40 37.1c-1.7 1.6-3 4.9-2.8 7.2l4.1 54.4c0.2 2.4 1.9 5.4 3.9 6.7l45.1 30.8c2 1.3 5.4 1.9 7.7 1.2l52-16.2z"
        />
      </svg>
    </div>
    <div class="log-in-area" autocomplete="off">
      <h4>We are <span>My Website</span></h4>
      <p class="login-welcome-message" v-if="hasDeviceCached">{{ $t('welcome-back-login') }}</p>
      <p class="login-welcome-message" v-else>{{ $t('welcome-message-login') }}</p>
      <span class="error-message">{{ cannotLogin ? $t('error.cannot-login-error') : '' }}</span>
      <div class="floating-label">
        <input v-model="email" placeholder="Email" type="text" name="email" id="email" autocomplete="off" />
        <label for="email">Email:</label>
      </div>
      <div class="floating-label">
        <input
          v-model="password"
          placeholder="Password"
          type="password"
          name="password"
          id="password"
          autocomplete="off"
        />
        <label for="password">Password:</label>
      </div>
      <div class="action-items">
        <a class="discrete disabled" @click="signUp">Sign up is disabled</a>
        <span>|</span>
        <button @click="login">Log in</button>
      </div>
    </div>
  </div>
</template>
<!-- <script src="https://www.google.com/recaptcha/api.js" async defer></script> -->
<script setup lang="ts">
  import { InjectCssInShadowRootFromString, InjectCssInShadowRoot } from '@/helpers/css-injector';
  import { onMounted, ref } from 'vue';
  import loginCss from './login.scss';
  import { useLang } from '@/services/lang-service';
  import { ToguroUserService } from '@/services/user-service';
  import { getDeviceId } from '@/helpers/matrix-helper';

  const root = ref<HTMLDivElement>();
  const email = ref('');
  const password = ref('');
  const cannotLogin = ref(false);
  const { $t } = useLang();
  const hasDeviceCached = getDeviceId();

  const signUp = async () => {
    console.log('TODO::');
    // const _password = hashSync(password.value, 10);

    // const result = await ToguroUserService.register(email.value.replace(/\@/, '/'), _password);
  };

  const login = async () => {
    try {
      if (email.value.length <= 3 || password.value.length <= 3) {
        throw new Error();
      }
      await ToguroUserService.login(email.value, password.value);
    } catch (err) {
      cannotLogin.value = true;
    }
  };

  onMounted(() => {
    InjectCssInShadowRoot(root.value!, 'style[cssr-id]');
    InjectCssInShadowRootFromString(root.value!, loginCss);
  });
</script>
