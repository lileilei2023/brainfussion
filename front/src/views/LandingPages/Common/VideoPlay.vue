
<script lang="ts" setup>
import { ref, reactive } from "vue";
//视频封面，为空时，会自动获取第一帧作为视频封皮
const poster = ref("");
// 视频配置参数大多都支持props传入
const options = reactive({
  width: 'auto', //播放器高度
  height: 'auto', //播放器高度
  color: "#409eff", //主题色
  title: '', //视频名称
  src: 'https://vjs.zencdn.net/v/oceans.mp4', //视频源，地址可通过传参传入
  muted: false, //静音
  webFullScreen: false,
  speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
  autoPlay: false, //自动播放ru
  loop: false, //循环播放
  mirror: false, //镜像画面
  ligthOff: false,  //关灯模式
  volume: 0.3, //默认音量大小
  control: false,  //是否显示控制器
})

</script>
<template>
  <div class="container">
    <div class="video-style" style="display: flex; justify-content: center; align-items: center;">
      <iframe width="853" height="480" src="https://www.youtube.com/embed/linlz7-Pnvw" title="Switzerland in 8K ULTRA HD HDR - Heaven of Earth (60 FPS)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
<!--      <iframe width="1141" height="642"  src='//player.bilibili.com/player.html?bvid=BV1FM411F7QA&cid=958230725&page=1&share_source=copy_web' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true'></iframe>-->
    </div>
  </div>
</template>

<style>
#video-player-parent {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}
#video-player-parent video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.video-style {
  width: 100%;
  height: 100%;
}

.dark .navbar {
  background-color: #222;
  border-radius: 1rem;
}
</style>