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
    质量(1~30以内数字)：<input type="number" class="input" v-model="quality">

    <br><br>
    <van-button type="primary" size="small" @click="toPreview">预览</van-button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <van-button type="primary" size="small"  @click="toDownload">下载</van-button>
    <br><br>
    <img v-show="gifImg" :src="gifImg" alt="">
    <br>
    <h2>视频转Gif</h2>
    <label for="fileinp">
      <van-button type="primary" size="small">选择视频</van-button><span>&nbsp;请选择或粘贴视频文件</span>
      <input type="file" id="fileinp" accept="video/*" @change="uploaderVideo">
    </label>
    <br><br>
    <video ref="video" class="video" v-show="video.videoUrl" controls="true" :src="video.videoUrl" @play="play" @pause="pause"></video>
    <br>
    <img v-show="video.gifImg" :src="video.gifImg" alt="">
    <hr>
    宽度：<input type="number" class="input" v-model="video.width">&nbsp;&nbsp;
    高度：<input type="number" class="input" v-model="video.height"><br>
    帧延时(ms)：<input type="number" class="input" v-model="video.delay"><br>
    质量(1~30以内数字,越低越清楚)：<input type="number" class="input" v-model="video.quality">
    <br><br>
    <van-button type="primary" size="small"  @click="toDownloadVideo">下载</van-button>
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
      delay: 500,
      quality: 10,
      video: {
        quality: 10,
        delay: 200,
        width: 0,
        height: 0,
        videoUrl: '',
        gifImg: ''
      }
    }
  },
  components: {
    Field,
    Uploader,
    VanButton: Button
  },
  methods: {
    async play () {
      this.videoGif = new GIF({
        workers: 2,
        quality: +this.video.quality,
        workerScript: './static/gifjs/gif.worker.js'
      });
      let video = this.$refs.video
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      this.videoTimer = setInterval(() => {
        canvas.width = +this.video.width;
        canvas.height = +this.video.height;
        canvas.delay = +this.video.delay
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); // getContext:设置画布环境；drawImage:画画
        this.loadImg({
          gif: this.videoGif,
          canvas,
          ctx,
          img: canvas.toDataURL("image/png")
        })
      }, +this.video.delay)

      this.videoGif.on('finished', blob => {
        this.video.gifImg = URL.createObjectURL(blob);
      })
    },
    pause () {
      clearInterval(this.videoTimer)
      setTimeout(() => {
        this.videoGif.render()
      },20)
    },
    uploaderVideo (e) {
      const videoFile = e.target.files[0];
      let url = URL.createObjectURL(videoFile);
      this.video.videoUrl = url
      setTimeout(() => {
        this.video.width = _this.$refs.video.videoWidth / 5
        this.video.height = _this.$refs.video.videoHeight / 5
      }, 1000)
    },
    toPreview () {
      this.createGif(this.uploader.map(item => item.content))
    },
    toDownload () {
      this.createGif(this.uploader.map(item => item.content), true)
    },
    toDownloadVideo () {
      if (!this.video.videoUrl) {
        Toast('请先选择视频')
      }
      if (!this.video.gifImg) {
        Toast('请播放选择视频')
      }
      const element = document.createElement('a');
      element.setAttribute('download', 'img')
      element.setAttribute('href', this.video.gifImg)
      element.click()
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
        quality: +this.quality,
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
        canvas.width = +this.width
        canvas.height = +this.height
        canvas.delay = +this.delay
        await this.loadImg({
          gif,
          canvas,
          ctx,
          img: imgs[i]
        })
      }
      gif.render()
    },
    loadImg ({gif, canvas, ctx, img } = config) {
      return new Promise(resolve => {
        const imgImage = new Image();
        imgImage.src = img;
        ctx.fillRect(0, 0, canvas.width, canvas.height);//铺底色
        imgImage.onload = (e) => {
          ctx.drawImage(imgImage, 0, 0, canvas.width, canvas.height);
          gif.addFrame(canvas, {copy: true, delay: canvas.delay});
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
        const clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
        if (!clipboardData.items) return
        // todo粘贴板多内容还存在一些问题
        let cliDataArr = []
        for (let i = 0; i < clipboardData.items.length; i++) {
          cliDataArr.push(clipboardData.items[i])
        }
        const imgIndex = cliDataArr.findIndex(item => item.type.startsWith('image'))
        const videoIndex = cliDataArr.findIndex(item => item.type.startsWith('video'))
        if (imgIndex !== -1) {
          const blob = clipboardData.items[imgIndex].getAsFile()
          const render = new FileReader();
          render.onload = (evt) => {
            //输出base64编码
            var base64 = evt.target.result;

            window._this.uploader.push({
              file: clipboardData.files[imgIndex],
              content: base64,
              message: '',
              status: ''
            })
            if (window._this.uploader.length === 1) { // hack  没有触发 watch
              this.setDefaultSize()
            }
          }
          render.readAsDataURL(blob);
        } else if (videoIndex !== -1) {
          console.log('todo video')
          // setInterval(function () {
          //   console.log('获取');
          //   video = document.getElementById("video");	//获取页面中的video元素
          //   canvas = document.createElement("canvas"); // 创建一个画布
          //   canvas.width = video.videoWidth * 0.1;
          //   canvas.height = video.videoHeight * 0.1;
          //   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); // getContext:设置画布环境；drawImage:画画
          //   var imgurl = canvas.toDataURL("image/png");
          //   that.igs_src = imgurl; // 获取图片的url
          //   that.imglist.push(imgurl);	//将每张图片的添加到vue对象imglist中
          //   if(document.getElementById('video').currentTime>=5){
          //     var img;
          //     clearInterval(timer);
          //     setTimeout(function () {
          //       img = document.getElementsByClassName('igs');
          //       for(var i=0;i<img.length;i++){
          //         gif.addFrame(img[i]);
          //       }
          //       gif.on('finished', function(blob) {
          //         console.log(blob);
          //         window.open(URL.createObjectURL(blob));
          //       });
          //       gif.render();
          //     },200)
          //   }
          // },1000)
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
  border: 1px solid #cccccc;
  border-radius: 2px;
}
.video {
  max-height: 400px;
  max-width: 300px;
}

label {
  position: relative;
}
#fileinp {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}
#btn {
  padding: 5px 10px;
  background: #00b0f0;
  color: #FFF;
  border: none;
  border-radius: 5px;
}
</style>
