document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const streamContainer = document.getElementById('stream-container');
    const addStreamButton = document.getElementById('add-stream-link');
    const addStreamForm = document.getElementById('add-stream-form');
    const newStreamForm = document.getElementById('new-stream-form');
    const cancelAddStreamButton = document.getElementById('cancel-add-stream');
    const streamsList = document.getElementById('streams-list');
    const logoutButton = document.getElementById('logout-link');
    const apiInfoLink = document.getElementById('api-info-link');
    const apiInfoContainer = document.getElementById('api-info-container');
    const apiInfoDiv = document.getElementById('api-info');
    const navbar = document.getElementById('navbar');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    let loggedInUser = localStorage.getItem('loggedInUser');

    // Utility functions
    function showElement(element) {
        element.classList.remove('hidden');
        element.classList.add('visible');
    }

    function hideElement(element) {
        element.classList.remove('visible');
        element.classList.add('hidden');
    }

    function validateLogin(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.username === username && user.password === password);
    }

    function validateRegistration(username) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.username === username);
    }

    function updateStreamList() {
        const streams = JSON.parse(localStorage.getItem('streams')) || [];
        streamsList.innerHTML = '';
        streams.forEach((stream, index) => {
            const streamItem = document.createElement('div');
            streamItem.classList.add('stream-item');
            streamItem.innerHTML = `
                <h3>${stream.title}</h3>
                <iframe src="${stream.url}" frameborder="0" allowfullscreen></iframe>
                <p><strong>تاريخ ووقت المباراة:</strong> ${stream.date} الساعة ${stream.time}</p>
                <p><strong>نتيجة المباراة:</strong> ${stream.result || 'غير متوفرة'}</p>
                <p>${stream.info}</p>
                ${loggedInUser === stream.owner ? `<button class="delete-stream" data-index="${index}">حذف البث</button>` : ''}
            `;
            streamsList.appendChild(streamItem);
        });

        const deleteButtons = document.querySelectorAll('.delete-stream');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const streams = JSON.parse(localStorage.getItem('streams')) || [];
                streams.splice(index, 1);
                localStorage.setItem('streams', JSON.stringify(streams));
                updateStreamList();
            });
        });
    }

    function handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (validateLogin(username, password)) {
            loggedInUser = username;
            localStorage.setItem('loggedInUser', loggedInUser);
            hideElement(loginContainer);
            showElement(streamContainer);
            showElement(navbar);
            updateStreamList();
            document.getElementById('add-stream-link').classList.remove('hidden');
            document.getElementById('logout-link').classList.remove('hidden');
        } else {
            loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
    }

    function handleRegistration() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (validateRegistration(username)) {
            registerError.textContent = 'اسم المستخدم موجود بالفعل';
        } else {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.push({ username, password });
            localStorage.setItem('users', JSON.stringify(users));
            alert('تم إنشاء الحساب بنجاح!');
            hideElement(registerContainer);
            showElement(loginContainer);
        }
    }

    function handleAddStream() {
        const title = document.getElementById('stream-title').value;
        const url = document.getElementById('stream-url').value;
        const result = document.getElementById('match-result').value;
        const info = document.getElementById('match-info').value || 'معلومات غير متوفرة';
        const owner = loggedInUser;

        const now = new Date();
        const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const streams = JSON.parse(localStorage.getItem('streams')) || [];
        streams.push({ title, url, date, time, result, info, owner });
        localStorage.setItem('streams', JSON.stringify(streams));
        updateStreamList();
        hideElement(addStreamForm);
        newStreamForm.reset();
    }

    async function fetchMatchInfo() {
        try {
            const response = await fetch('https://api.example.com/match-info'); // استخدم API حقيقي هنا
            const data = await response.json();
            apiInfoDiv.innerHTML = `
                <h3>${data.matchTitle}</h3>
                <p><strong>تاريخ المباراة:</strong> ${data.matchDate}</p>
                <p><strong>الوقت:</strong> ${data.matchTime}</p>
                <p><strong>نتيجة المباراة:</strong> ${data.matchResult}</p>
            `;
        } catch (error) {
            apiInfoDiv.innerHTML = '<p>فشل في تحميل معلومات المباراة.</p>';
        }
    }

    // Event listeners
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegistration();
    });

    addStreamButton.addEventListener('click', () => {
        showElement(addStreamForm);
    });

    cancelAddStreamButton.addEventListener('click', () => {
        hideElement(addStreamForm);
    });

    newStreamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddStream();
    });

    logoutButton.addEventListener('click', () => {
        loggedInUser = null;
        localStorage.removeItem('loggedInUser');
        hideElement(streamContainer);
        hideElement(navbar);
        showElement(loginContainer);
        document.getElementById('add-stream-link').classList.add('hidden');
        document.getElementById('logout-link').classList.add('hidden');
    });

    apiInfoLink.addEventListener('click', () => {
        showElement(apiInfoContainer);
        fetchMatchInfo();
    });

    showRegisterLink.addEventListener('click', () => {
        hideElement(loginContainer);
        showElement(registerContainer);
    });

    showLoginLink.addEventListener('click', () => {
        hideElement(registerContainer);
        showElement(loginContainer);
    });

    // Initial setup
    if (loggedInUser) {
        showElement(streamContainer);
        showElement(navbar);
        document.getElementById('add-stream-link').classList.remove('hidden');
        document.getElementById('logout-link').classList.remove('hidden');
    } else {
        hideElement(streamContainer);
        hideElement(navbar);
        showElement(loginContainer);
    }
});
