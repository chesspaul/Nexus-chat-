from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO, emit, join_room, leave_room
from models.user import db, User ,Message
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'clave-secreta-temporal'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
socketio = SocketIO(app)

online_users = {}

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Necesitas iniciar sesión para entrar'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

#crear la tabla si es que no existe
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods =['GET', 'POST'])
def login():

    if current_user.is_authenticated:
        return redirect(url_for('chat'))

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user= User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('chat'))
        else:
            flash('Usuario o contraseña incorrecto.', 'error')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():

    if current_user.is_authenticated:
        return redirect(url_for('chat'))

    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        #verificar que el usuario si existe
        if User.query.filter_by(username=username).first():
            flash('Este nombre de usuario ya existe', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('Este email ya esta registrado', 'error')
            return redirect(url_for('register'))

        #Creación de usuarios con contraseña hasheada
        hashed_password = generate_password_hash(password)
        new_user= User(username=username, email=email, password=hashed_password)

        db.session.add(new_user)
        db.session.commit()

        flash('Cuenta creada. Ahora iniciar seción.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html', username=current_user.username)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

#Eventos de SocketI0
@socketio.on('connect')
def on_connect():
    online_users[current_user.username] = request.sid
    print(f'{current_user.username} se conectó')
    #Avisar a todos que hay un usuario online
    emit('update_users', list(online_users.keys()), broadcast=True)

@socketio.on('disconnect') 
def on_disconnect():
    online_users.pop(current_user.username, None)
    print(f'{current_user.username} se desconectó')
    emit('status', {'msg': f'{current_user.username} salió del chat'}, broadcast=True)
    emit('update_users', list(online_users.keys()), broadcast=True)

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    #Traer los ultimos 50 mensajes de esa sala
    history = Message.query.filter_by(room= room)\
    .order_by(Message.timestamp.asc())\
    .limit(50).all()


    for msg in history:
        emit('receive_message',{
            'username': msg.username,
            'message': msg.content,
            'room': room,
            'timestamp': msg.timestamp.strftime('%Y-%m-%dT%H:%M:%S')
        })

    emit('status', {'msg': f'{current_user.username} entró a #{room}'}, to=room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    emit('status', {'msg': f'{current_user.username} salió de #{room}'}, to=room)

@socketio.on('send_message')
def handle_message(data):
    room = data['room']
    message = data['message']
    username = current_user.username

    #Guardar en la base de datos
    new_message = Message(content=message, username=username, room=room)
    db.session.add(new_message)
    db.session.commit()

    emit('receive_message', {
        'username': username,
        'message': message,
        'room': room,
        'timestamp': new_message.timestamp.strftime('%Y-%m-%dT%H:%M:%S')
    }, to=room)

    emit('new_message_notify', { 'room': room }, broadcast=True )

@socketio.on('typing')
def on_typing(data):
    room= data['room']
    emit('user_typing',{
        'username': current_user.username
    }, to=room, include_self=False)

@socketio.on('stop_typing')
def on_stop_typing(data):
    room= data['room']
    emit('user_stop_typing',{}, to=room, include_self=False)

if __name__ == '__main__':
    socketio.run(app, debug=True)