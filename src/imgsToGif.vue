<template>
	<div>
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

		<img class="preview-img" v-show="gifImg" :src="gifImg" alt="">
		<br><br>
	</div>
</template>

<script>
import { Field, Uploader } from "vant";
import GIF from "gif.js";

export default {
  components: {
    Field,
    Uploader
	},
  data () {
    return {
      uploader: [],
      gifImg: '',
      width: 0,
      height: 0,
      delay: 500,
      quality: 10
		}
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
        return this.$toast('请上传图片');
      }
      if(this.uploader.length < 2) {
        return this.$toast('至少需要上传两张图片');
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
	mounted () {
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
            this.uploader.push({
              file: clipboardData.files[imgIndex],
              content: base64,
              message: '',
              status: ''
            })
            if (this.uploader.length === 1) { // hack  没有触发 watch
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
.preview-img {
	max-width: 300px;
	max-height: 400px;
}
</style>