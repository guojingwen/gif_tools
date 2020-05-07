<template>
  <div id="app">
    <h2>自制解压神器&文档助手</h2>
    <video-to-gif></video-to-gif>
    <hr>
    <img-to-gif></img-to-gif>
  </div>
</template>

<script>
import Vue from 'vue'
import ImgToGif from './imgToGif.vue'
import VideoToGif from './videoToGif.vue'
import { Button, Toast} from 'vant'
Vue.use(Toast)
Vue.use(Button)
export default {
  name: 'App',
  components: {
    ImgToGif,
    VideoToGif
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
