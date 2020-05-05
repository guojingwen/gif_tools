createGif([
  './imgs/1.png',
  './imgs/2.png',
  './imgs/3.png',
  './imgs/4.png',
  './imgs/5.png',
  './imgs/6.png',
  './imgs/7.png'
], 100)

async function createGif(imgs, delay) {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: './lib/gif.worker.js'
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
    await loadImg(gif, canvas, ctx, imgs[i])
  }
  gif.render()
}

function loadImg (gif, canvas, ctx, img) {
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