// 检查Firebase是否加载
if (typeof firebase === 'undefined') {
    alert('错误：Firebase SDK 未加载！请检查网络连接或刷新页面。');
    console.error('Firebase SDK 未加载');
}

// Firebase配置
const firebaseConfig = {
    apiKey: "AIzaSyBzGofWMsL3lZQhceZLJ6ZL2l9c6c-oN4s",
    authDomain: "my-learning-checkin.firebaseapp.com",
    databaseURL: "https://my-learning-checkin-default-rtdb.firebaseio.com",
    projectId: "my-learning-checkin",
    storageBucket: "my-learning-checkin.firebasestorage.app",
    messagingSenderId: "470346711474",
    appId: "1:470346711474:web:d45d57dbe0d150d0e064ab",
    measurementId: "G-K1E30774JS"
};

// 初始化Firebase
let app, auth, db;
try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    console.log('✅ Firebase 初始化成功');
} catch (error) {
    console.error('❌ Firebase 初始化失败:', error);
    alert('Firebase 初始化失败：' + error.message);
}

// 用户UID映射（从Firebase Authentication获取的实际UID）
// 键：Firebase Authentication 中的 UID
// 值：数据库路径中使用的用户名（user1 或 user2）
const USER_UID_MAP = {
    'dw5CV9FQ45eTQhsZv14MB8lIs9g2': 'user1',
    'dgio57moiIhIXpzO2AYqhgeOAUP2': 'user2'
};

// 登录函数
function login() {
    console.log('🔵 登录函数被调用');
    
    // 检查Firebase是否初始化
    if (!auth) {
        alert('错误：Firebase 未初始化！请刷新页面重试。');
        console.error('auth 对象不存在');
        return;
    }
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('📧 邮箱:', email ? email.substring(0, 3) + '***' : '空');
    console.log('🔑 密码:', password ? '***' : '空');
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    // 禁用按钮，显示加载状态
    const loginBtn = document.querySelector('button[onclick="login()"]') || 
                     (window.event ? window.event.target : null);
    let originalText = '';
    if (loginBtn) {
        originalText = loginBtn.innerHTML;
        loginBtn.disabled = true;
        loginBtn.innerHTML = '登录中...';
    }
    
    console.log('🚀 开始登录...');
    
    auth.signInWithEmailAndPassword(email, password)
        .then(user => {
            console.log('✅ 登录成功!');
            console.log('用户UID:', user.uid);
            console.log('用户邮箱:', user.email);
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
            // loadData() 会在 onAuthStateChanged 中自动调用
        })
        .catch(error => {
            console.error('❌ 登录失败:', error);
            console.error('错误代码:', error.code);
            console.error('错误信息:', error.message);
            
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
            
            // 更友好的错误提示
            let errorMessage = '登录失败：';
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage += '用户不存在，请检查邮箱是否正确';
                    break;
                case 'auth/wrong-password':
                    errorMessage += '密码错误，请重试';
                    break;
                case 'auth/invalid-email':
                    errorMessage += '邮箱格式不正确';
                    break;
                case 'auth/user-disabled':
                    errorMessage += '该账户已被禁用';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += '网络连接失败，请检查网络';
                    break;
                default:
                    errorMessage += error.message;
            }
            alert(errorMessage);
        });
}

// 登出函数
function logout() {
    auth.signOut()
        .then(() => {
            console.log('已登出');
        })
        .catch(error => {
            console.error('登出失败:', error);
            alert('登出失败: ' + error.message);
        });
}

// 提交打卡
function submitCheckin() {
    const user = auth.currentUser;
    if (!user) {
        alert('请先登录');
        return;
    }
    
    const userId = USER_UID_MAP[user.uid];
    if (!userId) {
        alert('用户ID未识别，请联系管理员');
        return;
    }
    
    const input = document.getElementById('checkin-input').value.trim();
    if (!input) {
        alert('请输入学习内容');
        return;
    }
    
    const date = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    const timestamp = new Date().toISOString();
    
    // 保存打卡数据（包含内容和时间戳）
    db.ref(`users/${userId}/checkins/${date}`).set({
        content: input,
        timestamp: timestamp
    })
    .then(() => {
        document.getElementById('checkin-input').value = '';
        console.log('打卡成功:', date);
    })
    .catch(error => {
        console.error('打卡失败:', error);
        alert('打卡失败: ' + error.message);
    });
}

// 加载数据（实时监听）
function loadData() {
    const user = auth.currentUser;
    if (!user) return;
    
    const userId = USER_UID_MAP[user.uid];
    if (!userId) {
        alert('用户ID未识别');
        return;
    }
    
    const partnerId = userId === 'user1' ? 'user2' : 'user1';
    
    // 显示用户名
    document.getElementById('user-name').innerText = userId;
    
    // 实时监听我的打卡数据
    db.ref(`users/${userId}/checkins`).orderByKey().limitToLast(30).on('value', snapshot => {
        const list = document.getElementById('my-checkins');
        list.innerHTML = '';
        
        if (!snapshot.exists()) {
            list.innerHTML = '<li class="text-muted">暂无打卡记录</li>';
            return;
        }
        
        const checkins = [];
        snapshot.forEach(child => {
            checkins.push({
                date: child.key,
                data: child.val()
            });
        });
        
        // 按日期倒序排列（最新的在前）
        checkins.sort((a, b) => b.date.localeCompare(a.date));
        
        checkins.forEach(checkin => {
            const li = document.createElement('li');
            li.className = 'checkin-item';
            
            const content = typeof checkin.data === 'string' 
                ? checkin.data 
                : checkin.data.content || '无内容';
            
            const time = typeof checkin.data === 'object' && checkin.data.timestamp
                ? new Date(checkin.data.timestamp).toLocaleString('zh-CN')
                : '';
            
            li.innerHTML = `
                <strong>${checkin.date}</strong>
                ${time ? `<small class="text-muted"> (${time})</small>` : ''}
                <br>
                <span>${content}</span>
            `;
            list.appendChild(li);
        });
    }, error => {
        console.error('加载我的数据失败:', error);
    });
    
    // 实时监听伙伴的打卡数据
    db.ref(`users/${partnerId}/checkins`).orderByKey().limitToLast(30).on('value', snapshot => {
        const list = document.getElementById('partner-checkins');
        list.innerHTML = '';
        
        if (!snapshot.exists()) {
            list.innerHTML = '<li class="text-muted">小伙伴暂无打卡记录</li>';
            return;
        }
        
        const checkins = [];
        snapshot.forEach(child => {
            checkins.push({
                date: child.key,
                data: child.val()
            });
        });
        
        // 按日期倒序排列
        checkins.sort((a, b) => b.date.localeCompare(a.date));
        
        checkins.forEach(checkin => {
            const li = document.createElement('li');
            li.className = 'checkin-item partner';
            
            const content = typeof checkin.data === 'string' 
                ? checkin.data 
                : checkin.data.content || '无内容';
            
            const time = typeof checkin.data === 'object' && checkin.data.timestamp
                ? new Date(checkin.data.timestamp).toLocaleString('zh-CN')
                : '';
            
            li.innerHTML = `
                <strong>${checkin.date}</strong>
                ${time ? `<small class="text-muted"> (${time})</small>` : ''}
                <br>
                <span>${content}</span>
            `;
            list.appendChild(li);
        });
    }, error => {
        console.error('加载伙伴数据失败:', error);
        // 如果读取失败，可能是权限问题
        if (error.code === 'PERMISSION_DENIED') {
            list.innerHTML = '<li class="text-danger">无法读取小伙伴的数据（权限不足）</li>';
        }
    });
}

// 监听认证状态变化
if (auth) {
    auth.onAuthStateChanged(user => {
        console.log('🔐 认证状态变化:', user ? '已登录 (' + user.uid + ')' : '未登录');
        if (user) {
            // 已登录
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            loadData();
        } else {
            // 未登录
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('main-content').style.display = 'none';
        }
    });
} else {
    console.error('❌ auth 对象不存在，无法监听认证状态');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 页面加载完成');
    console.log('Firebase 版本:', firebase.SDK_VERSION || '未知');
    
    // 检查必要的元素是否存在
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const checkinInput = document.getElementById('checkin-input');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ 找不到登录输入框');
        alert('页面元素加载错误，请刷新页面');
        return;
    }
    
    console.log('✅ 所有元素加载成功');
    
    // 支持回车键登录
    if (emailInput && passwordInput) {
        [emailInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    login();
                }
            });
        });
    }
    
    // 支持回车键打卡
    if (checkinInput) {
        checkinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitCheckin();
            }
        });
    }
    
    // 添加登录按钮点击事件（备用方案）
    const loginBtn = document.querySelector('button[onclick="login()"]');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            login.call(this);
        });
    }
});
