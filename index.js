import express from "express";
import session from "express-session";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));


const sequelize = new Sequelize('PR_dz_ORM3', 'postgres', '123', {
    host: 'localhost',
    dialect: 'postgres'
});

try {
    await sequelize.authenticate();
    console.log('фурычит')
} catch (e) {
    console.log('не фурычит ', e.message)
};


const User = sequelize.define(
    'User',
    {
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userPassword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

console.log(User === sequelize.models.User);

await sequelize.sync();


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};



app.post('/register', async (req, res) => {
    const { userName, userPassword } = req.body;

    const realUser = await User.findOne({ where: { userName } });

    //проверка уникальность имени пользователя
    if (realUser) {
        return res.send('Имя уже занято');
    }

    //добавление нового пользователя в массив
    await User.create({ userName, userPassword });
    res.redirect('/login');

});

app.post('/login', async (req, res) => {
    const { userName, userPassword } = req.body;

    const user = await User.findOne({ where: { userName, userPassword } });

    if (user) {
        req.session.user = user.toJSON(); // Сохранение юзера в сессии
        res.redirect('/profile');
    } else {
        res.send('Неверное имя пользователя или пароль');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});



try {
    app.listen(PORT, () => console.log('андрей' + PORT));
} catch (e) {
    console.log(e.message)
};