<template>
    <div class="pdf-container">
        <div class="pdf-viewer">
            <VuePdf :key="currentPage" ref="pdf" :src="pdfSrc" :page="currentPage" :show-toolbar="false" :show-loading="false" />
            <div class="pdf-toolbar">
                <button class="btn btn-link bi bi-caret-left" @click="prevPage" :disabled="currentPage === 1"></button>
                <span class="pdf-page-count">{{ currentPage }} / {{ numOfPages }}</span>
                <button class="btn btn-link bi bi-caret-right" @click="nextPage" :disabled="currentPage === numOfPages"></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import { VuePdfPropsType } from 'vue3-pdfjs/components/vue-pdf/vue-pdf-props';
import 'bootstrap/dist/css/bootstrap.min.css';

export default defineComponent({
    name: 'Home',
    components: { VuePdf },
    setup() {
        const pdfSrc = ref<VuePdfPropsType['src']>(
            'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        );
        const numOfPages = ref(0);
        const currentPage = ref(1);

        onMounted(() => {
            const loadingTask = createLoadingTask(pdfSrc.value);
            loadingTask.promise.then(pdf => {
                numOfPages.value = pdf.numPages;
            });
        });

        function nextPage() {
            currentPage.value += 1;
        }

        function prevPage() {
            currentPage.value -= 1;
        }

        return {
            pdfSrc,
            numOfPages,
            currentPage,
            nextPage,
            prevPage,
        };
    },
});
</script>

<style scoped>
.pdf-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.pdf-viewer {
    position: relative;
    width: 100%;
    height: calc(100% - 3rem);
}

.pdf-toolbar {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 3rem;
    background-color: rgba(255, 255, 255, 0.8);
}

.pdf-page-count {
    margin: 0 1rem;
}

.btn-link {
    font-size: 1rem;
    color: #007bff;
    opacity: 0.5;
}

.btn-link:hover,
.btn-link:focus {
    color: #007bff;
    opacity: 1;
    text-decoration: none;
}

.bi {
    font-size: 1rem;
    opacity: 0.5;
}

.bi:hover,
.bi:focus {
    opacity: 1;
    text-decoration: none;
}
</style>
