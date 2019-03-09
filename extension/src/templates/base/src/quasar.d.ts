import Vue from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $q: any;
  }
}

// ComponentOptions is declared in types/options.d.ts
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    preFectch?: (options: any) => void | Promise<void>;
  }
}

declare module 'quasar';
