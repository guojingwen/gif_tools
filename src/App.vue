<template>
  <div id="app">
    <input type="file" class="mini" onchange="changepic(this)" accept="image/jpg,image/jpeg,image/png,image/PNG">上传图片</input>
    <div>
      图片尺寸 <br>
      宽:
      <input type="number" placeholder="请输入需要合成的图片宽度">
      高：
      <input type="number" placeholder="请输入需要合成的图片高度">

    </div>
    <button class="btn" @click="onCreateGif">上传图片合成GIF</button>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import GIF from 'gif.js'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods: {
    onCreateGif () {
      this.createGif([
        './static/imgs/1.png',
        './static/imgs/2.png',
        './static/imgs/3.png',
        './static/imgs/4.png',
        './static/imgs/5.png',
        './static/imgs/6.png',
        './static/imgs/7.png'
      ], 100)
    },
    async createGif(imgs, delay) {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: './static/gifjs/gif.worker.js'
      });
      gif.on('finished', function(blob) {
        //生成图片链接
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('download', 'img')
        element.setAttribute('href', url)
        element.click()
      })

      const canvas= document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < imgs.length; i++) {
        await this.loadImg(gif, canvas, ctx, imgs[i])
      }
      gif.render()
    },
    loadImg (gif, canvas, ctx, img) {
      return new Promise(resolve => {
        const imgImage = new Image();
        imgImage.src = img;
        imgImage.onload = function (e) {
          //Canvas绘制图片
          canvas.width = 508;
          canvas.height = 890;
          //铺底色
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imgImage, 0, 0, canvas.width, canvas.height);
          gif.addFrame(canvas,{copy:true,delay:500});
          resolve()
        }
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
