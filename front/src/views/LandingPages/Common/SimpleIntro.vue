<script setup>
import FilledInfoCard from "./FilledInfoCard.vue";
</script>
<template>
  <section class="py-7">
    <div class="container">
      <div class="row">
        <div class="col-lg-4">
          <FilledInfoCard
              class="p-4"
              :color="{ text: 'white', background: 'bg-gradient-success' }"
              :icon="{ component: 'flag', color: 'white' }"
              title="了解BrainFussion"
              description="我们致力于打造一个学术型交流社区，目前已有xx人在使用"
              :action="{
              route:
                'pages/landing-pages/about-us',
              label: { text: '了解更多', color: 'white' }
            }"
          />
        </div>
        <div class="col-lg-4">
          <FilledInfoCard
              class="p-4"
              :color="{ text: 'white', background: 'bg-gradient-warning' }"
              :icon="{ component: 'flag', color: 'white' }"
              title="个人Bot是什么"
              description="在个人Bot里可以构建个人知识库，通过上传的资料，生成不同专业能力的Bot"
              :action="{
              route:
                'pages/landing-pages/about-us',
              label: { text: '了解更多', color: 'white' }
            }"
          />
        </div>
        <div class="col-lg-4">
          <FilledInfoCard
              class="p-4"
              :color="{ text: 'white', background: 'bg-info' }"
              :icon="{ component: 'flag', color: 'white' }"
              title="Bot广场是什么"
              description="我们训练了具备专业知识的Bot，包括OpenAI的创始人、霍金等"
              :action="{
              route:
                'https://www.creative-tim.com/learning-lab/vue/overview/material-kit/',
              label: { text: '了解更多', color: 'white' }
            }"
          />
        </div>

      </div>
    </div>
  </section>

</template>


