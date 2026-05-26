const socket = io();

const messages = document.getElementById('messages');
const input = document.getElementById('msg-input');
const btnSend = document.getElementById('btn-send');
const roomLinks = document.querySelectorAll('.room');

let currentRoom = 'general';
const unreadCounts = {};
let unreadTotal = 0;
let pageVisible = true;

//Entrar a la sala al conectarse
socket.on('connect', function(){
    joinRoom('general');
});

//cuando el servidor manda un mensaje
socket.on('receive_message', function(data) {
    console.log('mensaje recibido:', data.room, 'currentRoom:', currentRoom);
    const div = document.createElement('div');
    const isOwn= data.username === currentUsername;

    div.classList.add('message');
    if (isOwn) div.classList.add('message-own');

    const initial= data.username.charAt(0).toUpperCase();
    const avatarColor= getAvatarColor(data.username);

    const time = new Date(data.timestamp + 'Z').toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
    <div class="msg-header">
        <div class="avatar" style="background: ${avatarColor}">${initial}</div>
        <span class="msg-user">${data.username}</span>
         <span class="msg-time">${time}</span>
    </div>
    <span class="msg-text">${data.message}</span>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

//Mensajes no leidos en otras salas
socket.on('new_message_notify', function(data){
    if(data.room !== currentRoom){
        unreadCounts[data.room] = (unreadCounts[data.room] || 0) + 1;
        updateUnreadBadge(data.room);
        updateTitle();
    }
});
//cambair sala al hacer clik
roomLinks.forEach(function(link){
    link.addEventListener('click', function(e){
        e.preventDefault();
        const  newRoom = this.dataset.room;
        if (newRoom === currentRoom)return;

        //salir de la sala actual
        socket.emit('leave', {room: currentRoom});

        //Quitar clase active
        roomLinks.forEach(r=> r.classList.remove('active'));
        this.classList.add('active');

        //Limpiar mensajes
        messages.innerHTML = '';

        //Entrar a la nueva sala
        joinRoom(newRoom);
    })
});

function joinRoom(room){
    currentRoom = room;
    socket.emit('join', {room: room});

    //Actualizar header
    document.querySelector('.chat-header h3').textContent = '#' + room;
    clearUnread(room);
}


// cuando alguien entra o sale
socket.on('status', function(data){
    const div= document.createElement('div');
    div.classList.add('status-msg');
    div.textContent = data.msg;
    messages.appendChild(div);

});

//Enviar mensaje con el boton
btnSend.addEventListener('click', sendMessage);

//Enviar mensaje con Enter
input.addEventListener('keypress', function(e){
    if(e.key === 'Enter') sendMessage();
});

function sendMessage(){
    const message = input.value.trim();
    if(message === '') return;
    socket.emit('send_message', { message: message , room:currentRoom});
    input.value = '';
}

//Actualizar la lista de usuarios online
socket.on('update_users', function(users){
    const list = document.getElementById('online-list');
    list.innerHTML = '';
    users.forEach(function(user){
        const li = document.createElement('li');
        li.classList.add('online-user');
        li.innerHTML = `<span class="online-dot"></span>${user}`;
        list.appendChild(li);

    });   
}); 

let typingTimer;

input.addEventListener('input', function(){
    socket.emit('typing',{ room: currentRoom});
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        socket.emit('stop_typing', {room: currentRoom});
    }, 1500)
});

socket.on('user_typing', function(data) {
    document.getElementById('typing-indicator').textContent=
    `${data.username} esta escribiendo...`;
});

socket.on('user_stop_typing', function() {
    document.getElementById('typing-indicator').textContent = '';
});

function getAvatarColor(username){
   const colors = [
        '#e94560', '#3498db', '#2ecc71', '#f39c12',
        '#9b59b6', '#1abc9c', '#e67e22', '#e74c3c'
    ];
    
    let hash = 0;
    for(let i = 0; i<username.length; i++){
        hash = username.charCodeAt(i) + ((hash<<5) -hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function updateUnreadBadge(room){
    const link = document.querySelector(`[data-room="${room}"]`);
    if (!link) return;
    let badge = link.querySelector('.badge');
    if (!badge){
        badge= document.createElement('span');
        badge.classList.add('badge');
        link.appendChild(badge);
    }
    badge.textContent = unreadCounts[room];
}

function clearUnread(room){
    unreadCounts[room] = 0;
    const link = document.querySelector(`[data-room="${room}"]`);
    if (!link) return;
    const badge = link.querySelector('.badge');
    if(badge) badge.remove();
}
 
function updateTitle(){
    if (!pageVisible) {
        unreadTotal++;
        document.title = `(${unreadTotal}) Nexus Chat`;
    }
}

document.addEventListener('visibilitychange', function(){
    pageVisible = !document.hidden;
    if (pageVisible){
        unreadTotal = 0;
        document.title = 'Nexus Chat';
    }
})

// Dark/Light mode toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light'){
    document.body.classList.toggle('light');
    themeToggle.textContent = '🌙';
};

themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});