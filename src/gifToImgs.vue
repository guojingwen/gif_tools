<template>
	<div>
		todo 分解gif修改指定帧内容
<!--		<input type="file" accept="image/gif" @change="addGif">-->
	</div>
</template>

<script>
import { SuperGif } from  '../lib/libgif.js'
export default {
  data () {
    return {
      gifUrl: '',
      gifName: ''
		}
	},
	methods: {
		addGif(e) {
		  this.gifUrl = URL.createObjectURL(e.target.files[0])
			this.gifName = e.target.files[0].name
		},
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      var n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    },
// 将canvas转换成file对象
    convertCanvasToImage(canvas, filename) {
      return this.dataURLtoFile(canvas.toDataURL('image/png'), filename);
    },
    pre_load_gif(gif_source) {
      var img_list = [];
      const gifImg = document.createElement('img');
      // gif库需要img标签配置下面两个属性
      gifImg.setAttribute('rel:animated_src', URL.createObjectURL(gif_source))
      gifImg.setAttribute('rel:auto_play', '0')
      // 新建gif实例
      var rub = new SuperGif({ gif: gifImg } );
      rub.load(() => {
        var img_list = [];
        for (let i=1; i <= rub.get_length(); i++) {
          // 遍历gif实例的每一帧
          rub.move_to(i);
          // 将每一帧的canvas转换成file对象
          let cur_file = this.convertCanvasToImage(rub.get_canvas(), gif_source.name.replace('.gif', '') + `-${i}`)
          img_list.push({
            file_name: cur_file.name,
            url: URL.createObjectURL(cur_file),
            file: cur_file,
          })
        }
        this.img_list = img_list
      });
    }
	}
}
</script>