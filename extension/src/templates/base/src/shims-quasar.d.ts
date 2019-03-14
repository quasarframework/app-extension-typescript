import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $q: any
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    preFetch?: (options: any) => void | Promise<void>
  }
}
