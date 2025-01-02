import DOMPurify from 'dompurify'

export default class Chat {
    constructor(){
        this.openedYet = false
        this.chatWrapper = document.querySelector("#chat-wrapper")
        this.openIcon = document.querySelector(".header-chat-icon")
        this.injectHTML() 
        this.chatLog = document.querySelector("#chat")
        this.chatField = document.querySelector("#chatField")
        this.chatForm = document.querySelector("#chatForm")
        this.closeIcon = document.querySelector(".chat-title-bar-close")
        this.events()
    }

    // Events
    events(){
        this.chatForm.addEventListener("submit", (e) => {
            e.preventDefault()
            this.sendMessageToServer()
        })
        this.openIcon.addEventListener("click", ()=> this.showChat())
        this.closeIcon.addEventListener("click", ()=> this.hideChat())
    }

    // methods

    sendMessageToServer(){
        this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value})
        this.chatLog.insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
                <div class="chat-self">
            <div class="chat-message">
            <div class="chat-message-inner">
                ${this.chatField.value}
            </div>
            </div>
            
        </div>
            `))

        this.chatLog.scrollTop = this.chatLog.scrollHeight
        this.chatField.value = ''
        this.chatField.focus()
    }

    showChat(){
        if(!this.openedYet){
            this.openConnection()
        }
        this.openedYet = true
        this.chatWrapper.classList.add("chat--visible")
        this.chatField.focus()
    }

    openConnection(){
        this.socket = io()
        this.socket.on('welcome', data => {
            this.username = data.username
            // add this.avatar = data.avatar when integrating avatars 
        })
        this.socket.on('chatMessageFromServer', (data) => {
            this.displayMessageFromServer(data)
        })
    }

    displayMessageFromServer(data){
        this.chatLog.insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
            <!-- template for messages from others -->
            <div class="chat-other">
                <div class="chat-message"><div class="chat-message-inner">
                <a href="/profile/${data.username}"><strong>${data.username}</strong></a>:
                ${data.message}
                </div></div>
            </div>
        <!-- end template-->
            `))

        this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    hideChat(){
        this.chatWrapper.classList.remove("chat--visible")
    }

    injectHTML(){
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
        </svg></span></div>
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }
}


// io.use(function (socket, next) {
//     sessionOptions(socket.request, socket.request.res || {}, next)
//   })