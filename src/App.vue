<template>
  <div id="app">
    <h2>上传或粘贴图片</h2>
    <field name="uploader" label="">
      <template #input>
        <uploader v-model="uploader" ref="imgs" />
      </template>
    </field>
    <h2>设置gif尺寸</h2>
    宽度：<input type="number" class="input" v-model="width">&nbsp;&nbsp;
    高度：<input type="number" class="input" v-model="height"><br>
    帧延时(ms)：<input type="number" class="input" v-model="delay"><br>
    质量(1~10以内数字)：<input type="number" class="input" v-model="quality">

    <br><br>
    <van-button type="primary" @click="toPreview">预览</van-button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <van-button type="primary" @click="toDownload">下载</van-button>
    <br><br>
    <img v-show="gifImg" :src="gifImg" alt="">
    <br>
    <h2>视频转Gif</h2>
  </div>
</template>

<script>
import GIF from 'gif.js'
import Vue from 'vue'
import { Field, Uploader, Button, Toast} from 'vant'
Vue.use(Toast)
export default {
  name: 'App',
  data () {
    return {
      uploader: [],
      gifImg: '',
      width: 0,
      height: 0,
      delay: 200,
      quality: 10
    }
  },
  components: {
    Field,
    Uploader,
    VanButton: Button
  },
  methods: {
    toPreview () {
      this.createGif(this.uploader.map(item => item.content))
    },
    toDownload () {
      this.createGif(this.uploader.map(item => item.content), true)
    },
    async createGif(imgs, needDownload = false) {
      if (!this.uploader.length) {
        return Toast('请上传图片');
      }
      if(this.uploader.length < 2) {
        return Toast('至少需要上传两张图片');
      }
      const gif = new GIF({
        workers: 2,
        quality: this.quality,
        workerScript: './static/gifjs/gif.worker.js'
      });
      gif.on('finished', blob => {
        this.gifImg = URL.createObjectURL(blob);
        if (!needDownload) return
        const element = document.createElement('a');
        element.setAttribute('download', 'img')
        element.setAttribute('href', this.gifImg)
        element.click()
      })

      const canvas= document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < imgs.length; i++) {
        await this.loadImg({
          gif,
          canvas,
          ctx,
          img: imgs[i]
        })
      }
      gif.render()
    },
    loadImg ({gif, canvas, ctx, img, } = config) {
      return new Promise(resolve => {
        const imgImage = new Image();
        imgImage.src = img;
        canvas.width = this.width
        canvas.height = this.height
        ctx.fillRect(0, 0, canvas.width, canvas.height);//铺底色
        imgImage.onload = function (e) {
          ctx.drawImage(imgImage, 0, 0, this.width, this.height);
          gif.addFrame(canvas, {copy:true, delay: this.delay});
          resolve()
        }
      })
    },
    setDefaultSize () {
      const img = document.createElement('img')
      img.setAttribute('src', this.uploader[0].content)
      img.setAttribute('style', "opacity: 0.01;")
      document.body.append(img)
      setTimeout(() => {
        const size = img.getBoundingClientRect()
        console.log(size)
        this.width = size.width
        this.height = size.height
        document.body.removeChild(img)
      }, 50)
    }
  },
  watch: {
    uploader(n, o) {
      if (n.length === 1 && !o.length) {
        this.setDefaultSize()
      }
    }
  },
  mounted() {
    window._this = this
    document.addEventListener('paste', (event) => {
      if (event.clipboardData || event.originalEvent) {
        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
        if (!clipboardData.types.includes('Files')) return
        if (clipboardData.items) {
          var  blob;
          for (var i = 0; i < clipboardData.items.length; i++) {
            if (clipboardData.items[i].type.indexOf("image") !== -1) {
              blob = clipboardData.items[i].getAsFile();
            }
          }
          var render = new FileReader();
          render.onload = (evt) => {
            //输出base64编码
            var base64 = evt.target.result;

            window._this.uploader.push({
              file: clipboardData.files[0],
              content: base64,
              message: '',
              status: ''
            })
            if (window._this.uploader.length === 1) { // hack  没有触发 watch
              this.setDefaultSize()
            }
          }
          render.readAsDataURL(blob);
        }
      }
    })

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
.input {
  width: 60px;
}
</style>
