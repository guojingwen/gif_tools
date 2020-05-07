<template>
	<div>
		<h2>视频转Gif</h2>
		<label for="fileinp">
			<van-button type="primary" size="small">选择视频</van-button><span>&nbsp;请选择或粘贴视频文件</span>
			<input type="file" id="fileinp" accept="video/*" @change="uploaderVideo">
		</label>
		<br> <br>
		<video ref="video" class="video" v-show="videoUrl" controls="true" :src="videoUrl" @play="play" @pause="pause"></video>

		<br>
		宽度：<input type="number" class="input" v-model="width">&nbsp;&nbsp;
		高度：<input type="number" class="input" v-model="height"><br>
		帧延时(ms)：<input type="number" class="input" v-model="delay"><br>
		质量(1~30以内数字,越低越清楚)：<input type="number" class="input" v-model="quality">
		<br>
		<van-button type="primary" size="small"  @click="toDownloadVideo">下载</van-button>
		<br><br>
		<img v-show="gifImg" :src="gifImg" alt="预览" ref="img">
		<br>
	</div>
</template>

<script>
import GIF from "gif.js";
import {Toast} from "vant";

export default {
  data () {
    return {
      videoGif: '',
      quality: 10,
      delay: 200,
      width: 0,
      height: 0,
      videoUrl: '',
      gifImg: ''
		}
	},
	methods: {
    async play () {
      this.videoGif = new GIF({
        workers: 2,
        quality: +this.quality,
        workerScript: './static/gifjs/gif.worker.js'
      });
      let video = this.$refs.video
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      this.videoTimer = setInterval(() => {
        canvas.width = +this.width;
        canvas.height = +this.height;
        canvas.delay = +this.delay
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); // getContext:设置画布环境；drawImage:画画
        this.loadImg({
          gif: this.videoGif,
          canvas,
          ctx,
          img: canvas.toDataURL("image/png")
        })
      }, +this.delay)

      this.videoGif.on('finished', blob => {
        this.gifImg = URL.createObjectURL(blob);
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
      this.videoUrl = url
      setTimeout(() => {
        this.width = this.$refs.video.videoWidth / 5
        this.height = this.$refs.video.videoHeight / 5
      }, 1000)
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
    toDownloadVideo () {
      if (!this.videoUrl) {
        return Toast('请先选择视频')
      }
      if (!this.gifImg) {
        return Toast('请播放视频生成预览图')
      }
      const element = document.createElement('a');
      element.setAttribute('download', 'img')
      element.setAttribute('href', this.gifImg)
      element.click()
    }
  }
}
</script>

<style>
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
</style>