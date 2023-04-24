<template>
    <div class="container mt-5">
        <h1>Chat with BabyMatrix</h1>
        <div class="card mt-3">
            <div class="card-body" ref="chatArea">
                <div v-for="(message, index) in messages" :key="index" :class="{'message': true, 'user-message': !message.isBot, 'bot-message': message.isBot, 'dynamic-bot-message': message.dynamicId}">
                    <div v-if="!message.dynamicId">{{ message.text }}</div>
                    <div v-else :id="message.dynamicId" v-html="message.html"></div>
                </div>
            </div>
        </div>
        <form class="mt-3" @submit.prevent="submitForm">
            <div class="form-group">
                <input type="text" class="form-control" v-model="userInput" placeholder="Type your message...">
            </div>
            <button type="submit" class="btn btn-primary">Send</button>
            <button class="btn btn-primary" @click="resetChat">新的对话</button>
        </form>
        <footer>
            <p>在Telegram上获取更好的体验: <a href="https://t.me/BabyMatrixBot">BabyMatrixBot</a></p>
        </footer>
    </div>
</template>

<script setup>
import marked from 'https://cdn.skypack.dev/marked?dts'
import hljs from 'https://cdn.skypack.dev/highlight.js?dts'
import markdownit from 'https://cdn.skypack.dev/markdown-it?dts'

const uniqueRandomNumber = () => {
    return Math.floor(Math.random() * Date.now())
}

hljs.initHighlightingOnLoad()

const data = {
    userInput: '',
    messages: [
        { text: 'BabyMatrix: 你好，请问有什么可以帮助到你?', isBot: true }
    ]
}

const methods = {
    submitForm() {
        const userInput = this.userInput.trim()
        if (userInput.length === 0) return
        this.messages.push({ text: `我：${userInput}`, isBot: false })
        this.messages.push({ text: 'BabyMatrix: 正在思考...', isBot: true })
        this.userInput = ''
        const url = 'https://api.example.com/get_json_response'
        const data = { user_input: userInput }
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                const md = new markdownit()
                const raw_data = `BabyMatrix: ${data.data.trim()}`
                const html = md.render(raw_data)
                const dynamicId = `my-div-${uniqueRandomNumber()}`
                this.messages.push({ html, dynamicId, isBot: true })
                this.$nextTick(() => {
                    const chatArea = this.$refs.chatArea
                    const dynamicElement = chatArea.querySelector(`#${dynamicId}`)
                    if (dynamicElement) {
                        dynamicElement.scrollTop = dynamicElement.scrollHeight
                        const codeElements = dynamicElement.querySelectorAll('pre code')
                        codeElements.forEach(block => {
                            hljs.highlightBlock(block)
                        })
                    }
                })
            })
            .catch(error => {
                console.error('Error:', error)
                this.messages.push({ text: 'BabyMatrix: 出了点问题，请稍后再试。', isBot: true })
            })
    },

    resetChat() {
        this.messages = [{ text: 'BabyMatrix: 你好，请问有什么可以帮助到你?', isBot: true }]
    }
}
</script>

<style>
.message {
    display: flex;
    margin-bottom: 10px;
    word-wrap: break-word;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 20px;
    padding: 10px;
    border-radius: 5px;
    background-color: #d0e8ff;
}

.user-message {
    background-color: #f3f3f3;
    align-self: flex-start;
}

.bot-message {
    background-color: #d0e8ff;
    align-self: flex-end;
}

.dynamic-bot-message {
    margin-bottom: 10px;
    word-wrap: break-word;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 20px;
    padding: 10px;
    border-radius: 5px;
    background-color: #d0e8ff;
    overflow-y: auto;
    max-height: 300px;
}

pre code {
    display: block;
    padding: 10px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 19px;
    color: #333;
    background-color: #f8f8f8;
    border-radius: 5px;
    border: 1px solid #ddd;
    word-wrap: normal;
}

pre code::before,
pre code::after {
    content: none;
}

footer {
    margin-top: 20px;
    text-align: center;
}

footer a {
    color: #000;
    font-weight: bold;
}

@media (max-width: 768px) {
    .container {
        max-width: 90%;
    }
}
</style>