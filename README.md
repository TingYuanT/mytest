# 📚 学习打卡系统

一个简单的私人学习打卡网站，用于记录每天的学习情况，并实时查看学习伙伴的进度。

## ✨ 功能特点

- 🔐 用户认证：使用 Firebase Authentication 进行安全登录
- 📝 打卡记录：记录每天的学习情况
- 👥 实时同步：实时查看自己和伙伴的打卡记录
- 🎨 美观界面：使用 Bootstrap 和自定义 CSS 美化
- 🔒 数据安全：Firebase 安全规则确保数据私有

## 🚀 快速开始

### 1. 前置要求

- 一个 Google 账户（用于创建 Firebase 项目）
- 现代浏览器（Chrome、Firefox、Edge 等）

### 2. 设置 Firebase

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 创建新项目（例如：`learning-checkin`）
3. 启用以下服务：
   - **Authentication**：启用 Email/Password 登录
   - **Realtime Database**：创建数据库（选择测试模式，稍后更新规则）
   - **Hosting**：用于部署（可选）

4. 在项目设置中添加 Web 应用，获取配置信息

5. 在 Authentication 中创建两个用户：
   - user1@example.com（你的邮箱）
   - user2@example.com（伙伴的邮箱）

6. 记录两个用户的 UID（在 Authentication > Users 中查看）

### 3. 配置项目

1. **更新 Firebase 配置**：
   - 打开 `script.js`
   - 将 Firebase 配置信息填入 `firebaseConfig` 对象

2. **更新用户 UID 映射**：
   - 在 `script.js` 中找到 `USER_UID_MAP` 对象
   - 将实际的 UID 填入：
   ```javascript
   const USER_UID_MAP = {
       '你的UID': 'user1',
       '伙伴的UID': 'user2'
   };
   ```

3. **设置数据库规则**：
   - 在 Firebase 控制台打开 Realtime Database > Rules
   - 复制 `rules.json` 的内容
   - 将 UID 替换为实际的 UID
   - 粘贴并发布规则

### 4. 本地测试

1. 直接在浏览器中打开 `index.html`
2. 使用创建的账户登录
3. 测试打卡功能

### 5. 部署到 Firebase Hosting（可选）

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化项目
firebase init

# 选择 Hosting，关联你的 Firebase 项目

# 部署
firebase deploy
```

## 📁 项目结构

```
learning-site/
├── index.html              # 主页面
├── script.js               # JavaScript 逻辑（Firebase 配置、登录、打卡等）
├── style.css               # 样式文件
├── rules.json              # Firebase 数据库安全规则（当前使用）
├── rules-optimized.json    # 优化版规则（可选）
├── FIREBASE_RULES_EXPLANATION.md  # 规则详解文档
└── README.md               # 本文件
```

## 🔒 安全规则说明

详细说明请查看 [FIREBASE_RULES_EXPLANATION.md](./FIREBASE_RULES_EXPLANATION.md)

**简要说明**：
- 两个用户都可以读取对方的数据（查看打卡记录）
- 每个用户只能写入自己的数据（只能修改自己的打卡）
- 未登录用户无法访问任何数据

## 🎯 使用说明

1. **登录**：使用创建的邮箱和密码登录
2. **打卡**：在输入框中输入今天的学习情况，点击"打卡"按钮
3. **查看记录**：左侧显示自己的打卡记录，右侧显示伙伴的记录
4. **实时更新**：当对方打卡时，你的页面会自动更新（无需刷新）

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **UI 框架**：Bootstrap 5.3
- **后端/数据库**：Firebase Realtime Database
- **认证**：Firebase Authentication
- **部署**：Firebase Hosting

## 📝 数据格式

打卡数据存储在以下路径：
```
/users
  /user1
    /checkins
      /2026-01-04: {
        content: "学习了3小时数学",
        timestamp: "2026-01-04T10:30:00.000Z"
      }
  /user2
    /checkins
      /2026-01-04: {
        content: "学习了2小时英语",
        timestamp: "2026-01-04T11:00:00.000Z"
      }
```

## ⚠️ 注意事项

1. **不要公开 Firebase 配置**：虽然 API Key 可以公开，但建议使用 Firebase 安全规则保护数据
2. **定期备份数据**：重要数据建议定期导出备份
3. **保护账户密码**：不要分享登录凭证
4. **检查规则**：确保 Firebase 规则正确配置

## 🐛 常见问题

### 无法登录
- 检查邮箱和密码是否正确
- 确认 Firebase Authentication 已启用 Email/Password
- 查看浏览器控制台的错误信息

### 无法读取数据
- 检查 Firebase 规则是否正确配置
- 确认 UID 映射是否正确
- 查看浏览器控制台的权限错误

### 数据不实时更新
- 检查网络连接
- 确认 Firebase Realtime Database 已启用
- 查看浏览器控制台的连接状态

## 📄 许可证

本项目仅供个人学习使用。

## 🙏 致谢

感谢 Firebase 提供的免费服务，让这个项目得以实现。
