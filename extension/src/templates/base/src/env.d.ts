declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE?: import("vue-router").RouterMode
    VUE_ROUTER_BASE?: string
  }
}
