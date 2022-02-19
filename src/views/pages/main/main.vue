<template>
  <div class="toguro-main">
    <toguro-login />
  </div>
</template>

<script setup lang="ts">
  import gettersOfApp from '@/store/modules/app/getters';
  import { computed } from 'vue';
  import toguroLogin from '@/views/components/login/login.vue';
  import { useLang } from '@/services/lang-service';
  const { $t } = useLang();
  const appLoaded = computed(gettersOfApp.appLoaded);
</script>
