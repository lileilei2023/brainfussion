<script setup>
import { onMounted, ref, reactive } from "vue";
import axios from "axios";
import setNavPills from "@/assets/js/nav-pills.js";
import DefaultNavbar from "@/examples/navbars/NavbarDefault.vue";
import DefaultFooter from "@/examples/footers/FooterDefault.vue";
import CenteredBlogCard from "@/examples/cards/blogCards/CenteredBlogCard.vue";
import image from "@/assets/img/illustrations/illustration-signin.jpg";
import setMaterialInput from "@/assets/js/material-input";

const dataList = ref([]);
const page = ref(0);
const isLoading = ref(false);

const urlData = ref("https://jsonplaceholder.typicode.com/posts?_page=" + page.value + "&_limit=10");

const publicUrlData = ref(
    `https://jsonplaceholder.typicode.com/posts?_page=${page.value}&_limit=10`
);

const privateUrlData = ref(
    `https://jsonplaceholder.typicode.com/posts?_page=${page.value}&_limit=10`
);

const fetchData = async () => {
  isLoading.value = true;
  const response = await axios.get(urlData.value);
  isLoading.value = false;
  dataList.value = [...dataList.value, ...response.data];
  page.value++;
};

const handleClick = async (newUrlData) => {
  urlData.value = newUrlData;
  await fetchData();
};

onMounted(() => {
  setMaterialInput();
  setNavPills();

  const scrollArea = document.querySelector(".row");
  scrollArea.addEventListener("scroll", () => {
    const { scrollTop, clientHeight, scrollHeight } = scrollArea;
    if (scrollTop + clientHeight >= scrollHeight) {
      fetchData();
    }
  });

  fetchData();
});
</script>
<template>
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <DefaultNavbar
            :sticky="true"
            :action="{
            route: 'https://www.creative-tim.com/product/vue-material-kit-pro',
            color: 'bg-gradient-success',
            label: '注册/登录',
          }"
        />
      </div>
    </div>
  </div>
  <div class="page-header min-vh-100" style="margin-top: 3%">
    <div class="container">
      <section class="py-7">
        <div class="container">
          <div class="row">
            <div class="col-lg-4 mx-auto">
              <div class="nav-wrapper position-relative end-0">
                <ul class="nav nav-pills nav-fill p-1" role="tablist">
                  <li class="nav-item">
                    <a
                        class="nav-link mb-0 px-0 py-1 active"
                        data-bs-toggle="tab"
                        href="#profile-tabs-simple"
                        role="tab"
                        aria-controls="profile"
                        aria-selected="true"
                        @click="handleClick('https://jsonplaceholder.typicode.com/posts?_page=' + 1 + '&_limit=10')"
                    >
                      Bot 广场列表
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                        class="nav-link mb-0 px-0 py-1"
                        data-bs-toggle="tab"
                        href="#dashboard-tabs-simple"
                        role="tab"
                        aria-controls="dashboard"
                        aria-selected="false"
                        @click="handleClick('https://jsonplaceholder.typicode.com/posts?_page=' + 2 + '&_limit=20')"
                    >
                      私人 Bot列表
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="pt-3 mt-5">
        <div class="row row-cols-1 row-cols-md-3" ref="scrollArea">
          <div class="col " v-for="data in dataList" :key="data.id">
            <div class="card-wrap">
              <CenteredBlogCard
                  image="https://bit.ly/3q0AlKO"
                  :title="data.title"
                  :description="data.description"
              />
              <div class="mb-4"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <DefaultFooter />
</template>
<style>
.card-wrap {
  width: 300px; /* 设置卡片的宽度 */
  height: 400px; /* 设置卡片的高度 */
  margin-bottom: 10px;
  text-overflow: ellipsis;
}
</style>

