<script setup>
import DefaultNavbar from "@/examples/navbars/NavbarDefault.vue";
import ChatDialog from "./ChatDialog.vue";
import PdfView from "./PdfView.vue";
import { ref } from "vue";
import { Cloud } from "laf-client-sdk";

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
amount.value = 100;

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


//获取验证码

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
//发送消息
async function send() {
    //发送时验证登录
    if (localStorage.getItem("access_token") == null)
        return ElMessage({
            message: "请先登录！",
            type: "error",
        });
    //判断用户次数
    if (amount.value <= 0)
        return ElMessage({
            message: "您的剩余次数不足，请充值！",
            type: "error",
        });
    //判断是否回复
    if (loading.value) return;
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

//验证用户是否付款
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
    <div class="container">
        <div class="row">

            <div class="col-sm">
                <PdfView />
            </div>
            <div class="col-sm">
                <ChatDialog />

            </div>
        </div>
    </div>
    <div class="page-header min-vh-100" style="margin-top: 3%">


    </div>

<!--    <DefaultFooter />-->
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

