import { reactive } from 'vue';

export interface AppState {
  appLoaded: boolean;
  appAccessToken: string;
}

const state: AppState = reactive({
  appLoaded: false,
  appAccessToken: ''
});

if (import.meta.env.MODE === 'development') {
  (window as any).appGetters = state;
}

export default state;
