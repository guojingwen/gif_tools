<template>
  <div id="app">
    <h2>自制解压神器&文档助手</h2>
    <video-to-gif></video-to-gif>
    <hr>
    <imgs-to-gif></imgs-to-gif>
    <hr>
    <gif-to-imgs></gif-to-imgs>
  </div>
</template>

<script>
import Vue from 'vue'
import ImgsToGif from './imgsToGif.vue'
import VideoToGif from './videoToGif.vue'
import GifToImgs from './gifToImgs.vue'
import { Button, Toast} from 'vant'
import 'gif.js'
Vue.use(Toast)
Vue.use(Button)
export default {
  name: 'App',
  components: {
    ImgsToGif,
    VideoToGif,
    GifToImgs
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  padding: 20px;
}
</style>
