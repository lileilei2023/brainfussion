<script setup>
import { ref } from "vue";
import { Cloud } from "laf-client-sdk";
// 将marked 引入
import { marked } from "marked";
import { User } from "@element-plus/icons-vue";
import QrcodeVue from "qrcode.vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const cloud = new Cloud({
    baseUrl: "https://jyf6wk.laf.dev",
    getAccessToken: () => localStorage.getItem("access_token"),
    timeout: 60000,
});

//======================================data======================================
//消息列表
const list = ref([]);
//输入框绑定消息
const question = ref("");
//判断消息是否为空
const parentMessageId = ref("");
//获取消息loading
const loading = ref(false);
//充值dialog
const centerDialogVisible = ref(false);
//登录dialog
const centerDialogVisible2 = ref(false);
//手机号
const phone = ref("");
//验证码
const code = ref("");
//判断是否还在倒计时
const codebut = ref(false);
//手机号码错误弹出框
const err = ref(false);
//充值选项
const indexUp = ref(0);
//二维码展示dialog
const upCode = ref(false);
//发送验证码
const content = ref("发送验证码");
//验证码倒计时
const totalTime = ref(60);
//获取验证码按钮日否可以点击
const canClick = ref(true);
//用户剩余次数
const amount = ref(0);
//二维码链接
const codeUrl = ref("");
//订单号
const payOrder = ref("");
//判断设备
const isMobile = ref(false);
//输入框提示
const placeholder = ref("输入你的指令");
//验证手机号
const tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

//======================================created======================================

// 获取用户剩余次数
getAmount();

// 判断是否为移动设备
if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
) {
    isMobile.value = true;
} else {
    placeholder.value = "输入你的指令（Shift + Enter = 换行,Enter = 发送）";
}

//======================================function======================================

// 获取用户剩余次数
async function getAmount() {
    if (!localStorage.getItem("access_token")) return;
    const res = await cloud.invoke("get-amount");
    amount.value = res.amount;
}

//获取验证码
async function getCode() {
    if (!tel.test(phone.value)) return (err.value = true);
    if (codebut.value) return;
    countDown();
    const res = await cloud.invoke("getCode", { phone: phone.value });
}

//验证码倒计时
function countDown() {
    if (!canClick.value) return;
    codebut.value = true;
    canClick.value = false;
    content.value = totalTime.value + "s后重新发送";
    let clock = window.setInterval(() => {
        totalTime.value--;
        content.value = totalTime.value + "s后重新发送";
        if (totalTime.value < 0) {
            window.clearInterval(clock);
            content.value = "重新发送验证码";
            totalTime.value = 60;
            canClick.value = true; //这里重新开启
            codebut.value = false;
        }
    }, 1000);
}

//验证登录
async function login() {
    const res = await cloud.invoke("login", { phone: phone.value, code: code.value });
    console.log(res);
    if (res.code === 1) {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        success();
        centerDialogVisible2.value = false;
        getAmount();
    } else {
        ElMessage({
            message: "无效的验证码",
            type: "error",
        });
    }
}

//发送消息
async function send() {
    //发送时验证登录
    // if (localStorage.getItem("access_token") == null)
    //     return ElMessage({
    //         message: "请先登录！",
    //         type: "error",
    //     });
    //判断用户次数
    // if (amount.value <= 0)
    //     return ElMessage({
    //         message: "您的剩余次数不足，请充值！",
    //         type: "error",
    //     });
    //判断是否回复
    // if (loading.value) return;
    list.value.push({
        text: question.value,
        avatar: "/avatar.jpeg",
    });
    //定位页面位置
    setScreen();
    const message = question.value;
    question.value = "";
    loading.value = true;
    let res;
    if (message == "") {
        loading.value = false;
        list.value.push({
            text: "问题不能为空！",
            avatar: "/logo.jpg",
        });
        setScreen();
        return;
    }
    try {
        const md = new MarkdownIt({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return (
                            '<pre class="hljs"><code>' +
                            hljs.highlight(lang, str, true).value +
                            "</code></pre>"
                        );
                    } catch (__) {}
                }
                return (
                    '<pre class="hljs"><code>' +
                    md.utils.escapeHtml(str.replace(/[\r\n]+/g, "\n")) +
                    "</code></pre>"
                );
            },
        });

        list.value.push({
            text: "",
            avatar: "/logo.jpg",
        });

        const token = localStorage.getItem("access_token");

        const obj = { message };
        if (parentMessageId.value) obj.parentMessageId = parentMessageId.value;

        axios({
            url: `https://jyf6wk.laf.dev/send`,
            method: "post",
            data: obj,
            responseType: "text",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            onDownloadProgress: function (progressEvent) {
                const xhr = progressEvent.event.target;

                const { responseText } = xhr;

                const parts = responseText.split("--!");
                parentMessageId.value = parts[1];

                list.value[list.value.length - 1].text = md.render(parts[0]);
                loading.value = false;
                setScreen();
            },
        }).then(() => {
            getAmount();
        });

        // 返回 id 并保存
    } catch (error) {
        console.log(error);
        loading.value = false;
        list.value.push({
            text: "出错了，请重试！",
            avatar: "/logo.jpg",
        });
        setScreen();
        return;
    }
}

//定位页面位置
function setScreen() {
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 0);
}

//验证手机号码弹出框
function close() {
    err.value = false;
}

//判断用户选择项
function select(e) {
    indexUp.value = e;
}

//点击充值
function openCode() {
    let num = 0;
    if (indexUp.value == 0) num = 2000;
    if (indexUp.value == 1) num = 5000;
    if (indexUp.value == 2) num = 100000;

    const res = cloud.invoke("pay", { amount: num });
    payOrder.value = res.orderId;
    codeUrl.value = res.codeUrl;
    centerDialogVisible.value = false;
    upCode.value = true;
    checkPay();
}

//验证用户是否付款
async function checkPay() {
    const res = await cloud.invoke("check-pay-ordet", { order: payOrder.value });
    if (res.code == 1) {
        upCode.value = false;
        getAmount();
        ElMessage({
            message: "充值成功",
            type: "success",
        });
    } else {
        setTimeout(() => {
            checkPay();
        }, 1000);
    }
}

//发送消息适配PC或phone
function handleEnter(e) {
    if (e.key === "Enter" && !isMobile.value && !e.shiftKey) {
        send();
    }
}

//消息弹出框
const success = () => {
    ElMessage({
        message: "登录成功",
        type: "success",
    });
};

//判断是否登录
function judge() {
    const access_token = localStorage.getItem("access_token");
    if (access_token)
        return ElMessage({
            message: "您已经登录过了",
            type: "success",
        });
    centerDialogVisible2.value = true;
}

//登录后可点击充值
function judgeUp() {
    if (!localStorage.getItem("access_token"))
        return ElMessage({
            message: "请登录",
            type: "error",
        });
    centerDialogVisible.value = true;
}
</script>

<template>
    <div id="myList">
        <div
            v-show="item.text"
            :class="item.type === 0 ? 'problemList' : 'answerList'"
            v-for="item in list"
        >
            <img class="listImg" :src="item.avatar" alt="" />
            <div v-html="item.text" class="listText"></div>
        </div>

        <div v-show="loading" class="answerList">
            <img class="listImg" src="/logo.jpg" alt="" />
            <img class="addin" src="/loading.gif" alt="" />
        </div>
    </div>

    <!-- ------------------------------------------------------ -->

    <!-- 输入框 -->
    <div class="inputbox">
        <el-input
            v-model="question"
            v-bind:readonly="loading"
            maxlength="2000"
            tabindex="0"
            :autosize="{ minRows: 1, maxRows: 5 }"
            type="textarea"
            :placeholder="placeholder"
            @keypress="handleEnter"
        />

        <!-- 发送按钮小飞机 -->
        <div class="btn-send" @click="send" style="background-color: #e8e3e3">
            <div class="send-view" style="display: flex">
<!--                <svg t="1681344992358" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5604" width="200" height="200"><path d="M900.4 117.6c-8.3-5.5-19.1-5.5-27.5 0L123.5 617.2c-7.7 5.1-12 14.1-11 23.3 0.9 9.2 6.9 17.2 15.5 20.6l195.3 78.2 91.9 160.9c4.5 7.9 12.9 12.8 22 12.7 8.8 0 17-4.7 21.5-12.2l52-86.4 242.1 96.9c2.9 1.2 6.1 1.8 9.2 1.7 12.4 0.2 23-8.8 25-21l124.9-749.4c1.5-9.8-3-19.6-11.5-24.9zM437.3 836.5l-70.2-121.7L840 208 437.3 836.5z" fill="#3259CE" p-id="5605"></path></svg>-->
                <svg t="1681345213587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10857" width="200" height="200"><path d="M512 0c282.7776 0 512 229.2224 512 512s-229.2224 512-512 512S0 794.7776 0 512 229.2224 0 512 0z m233.984 204.8c-2.56 0-5.12 0.4608-7.4752 1.3312l-3.4816 1.6896-570.368 329.216a20.3264 20.3264 0 0 0-10.9568 16.0256v4.096l0.512 4.2496c1.1776 5.4272 4.608 10.0864 9.4208 12.9024l3.84 1.7408 135.3216 55.6032 366.4384-317.1328-296.1408 363.1104v119.6032c0 2.9696 0.5632 5.9392 1.7408 8.6528l2.2016 3.84 2.8672 3.4304c1.4336 1.3824 3.072 2.56 4.8128 3.4816l2.7648 1.1776 3.6864 1.0752 3.84 0.3072 3.8912-0.256a20.1216 20.1216 0 0 0 10.2912-4.8128l2.6624-2.8672 82.944-101.0688 155.2896 63.3344 3.9936 1.28 4.1984 0.512 3.9424-0.3584a21.6576 21.6576 0 0 0 16.64-14.0288l1.024-3.7888 87.7056-526.6432a21.4016 21.4016 0 0 0-5.888-19.2512l-3.328-2.6624A21.5552 21.5552 0 0 0 746.0352 204.8z" fill="#1296db" p-id="10858"></path></svg>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page {
    position: relative;
    height: 100vh;
}

.defbut {
    position: fixed;
    right: 2px;
    bottom: 152px;
}
.btn-send {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    width: 48px;
    height: 32px;
    border-radius: 6px;
    color: rgba(0, 0, 0, 0.6);
    background: rgba(0, 0, 0, 0.1);
}
.btn-send:hover {
    cursor: pointer;
    opacity: 0.85;
}
.text {
    position: absolute;
    top: 50px;
    border: 1px solid #e5e5e5;
    height: 60px;
    padding: 10px;
    width: 90%;
}

#myList {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0px 0 60px 0;
    overflow-x: hidden;
    overflow-y: auto;
}

.problemList {
    display: flex;
    padding: 0px 200px;
}

.answerList {
    position: relative;
    padding: 20px 18px;
    font-size: 15px;
    display: flex;
    overflow-x: auto;
    white-space: pre-wrap;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
}

.listImg {
    margin-top: 5px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.listText {
    margin-left: 20px;
    padding-top: 10px;
    width: 100%;
    white-space: pre-wrap;
}

.inputbox {
    position: fixed;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: auto;
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 8px;
}
.pre {
    white-space: pre-wrap;
    text-indent: 2em;
    word-wrap: break-word;
    padding: 0 0 10% 0;
}

.inputbox button {
    margin-left: 15px;
    width: 56px;
    height: 82%;
    border-radius: 6px;
    border: 0;
    background: silver;
    color: #333;
    font-size: 14px;
    outline: none;
}

.inputbox button:hover {
    cursor: pointer;
    opacity: 0.8;
}

.addin {
    margin: 10px 20px;
    width: 30px;
    height: 30px;
}

.steppingstone {
    width: 100%;
    height: 160px;
}

.amount {
    margin: 5px;
    width: 100px;
    height: 40px;
    line-height: 44px;
    text-align: center;
    font-size: 16px;
    color: #606266;
}

.begintitle {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* padding: 50px 50px 30px 50px; */
}

.begintitle img {
    width: 200px;
}

.begintitle h1 {
    padding: 50px;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
}

.exhibition {
    width: 80%;
    margin: auto;
    display: flex;
    justify-content: space-around;
}

.witem p {
    margin: auto;
    padding: 10px;
    margin-top: 15px;
    font-size: 16px;
    border-radius: 5px;
    text-align: center;
}

.witem h3 {
    padding: 15px;
    font-size: 20px;
    color: #606266;
    text-align: center;
}

textarea {
    border: none;
    resize: none;
    cursor: pointer;
    outline: none;
    overflow-y: hidden;
}
.head {
    position: fixed;
    width: 100%;
    padding: 0px 30px;
    line-height: 50px;
    justify-content: end;
    border-bottom: 1px solid #e5e5e5;
    background-color: #fff;
    z-index: 10;
}

.cardbox {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.box-card {
    cursor: pointer;
    width: auto;
    margin: 20px;
    width: 160px;
    height: 140px;
    border: 1px solid #e6a23c;
}

.boxCard {
    width: auto;
    margin: 20px;
    width: 160px;
    height: 140px;
    border: 1px solid #fff;
}

.useNumber {
    width: 50%;
    height: 30px;
    margin: auto;
    text-align: center;
    font-size: 18px;
}
.money {
    width: 50%;
    height: 80px;
    line-height: 80px;
    margin: auto;
}
.sign {
    font-size: 16px;
    color: #e6a23c;
}
.number {
    width: 100%;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #e6a23c;
}
.accountbox {
    margin: auto;
    margin-top: 10px;
    display: flex;
}
.cheerbox {
    margin-top: 20px;
    width: 100%;
    display: flex;
    justify-content: right;
}
.qrcode {
    margin: auto;
    width: 300px;
}
.qrcodeText {
    margin: 20px 0 0 0;
    font-size: 20px;
    width: 100%;
    text-align: center;
}
.cheer {
    width: 100px;
    height: 50px;
}

.loginbutbox {
    margin: auto;
    margin-top: 20px;
    width: 120px;
    height: 40px;
    line-height: 40px;
}
.loginbut {
    width: 120px;
    height: 40px;
}

.inputname {
    width: 80px;
    line-height: 40px;
}
.contentText {
}
.lafText {
    margin-top: 50px;
    color: #56585d;
}

:deep(.el-dialog__body) {
    padding: 0;
}

@media screen and (max-width: 600px) {
    .text {
        position: absolute;
        top: 30px;
        border: 1px solid #e5e5e5;
        height: 45px;
        padding: 10px;
        width: 80%;
    }
    .dialog {
        width: 100%;
    }
    :deep(.el-dialog) {
        width: 100%;
    }

    .useNumber {
        width: 100%;
    }
    .money {
        width: 100%;
        text-align: center;
    }
    .head {
        padding: 0px 5px;
    }
    .amount {
        margin: 5px;
        width: 70px;
        height: 40px;
        line-height: 44px;
        text-align: center;
        font-size: 12px;
        color: #606266;
    }
}
</style>