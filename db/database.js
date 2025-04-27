const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保db目录存在
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const dbPath = path.join(dbDir, 'im2v.db');
const db = new sqlite3.Database(dbPath);

// 初始化数据库表
function initDatabase() {
  db.serialize(() => {
    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        nickname TEXT,
        balance REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('数据库初始化完成');
  });
}

// 添加用户
function addUser(username, password, email, nickname = null) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, password, email, nickname, balance) VALUES (?, ?, ?, ?, ?)`,
      [username, password, email, nickname || username, 0.0],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
}

// 根据用户名查找用户
function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 根据邮箱查找用户
function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 更新用户昵称
function updateNickname(userId, nickname) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET nickname = ? WHERE id = ?`,
      [nickname, userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

// 更新用户密码
function updatePassword(userId, password) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET password = ? WHERE id = ?`,
      [password, userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

// 更新账户余额
function updateBalance(userId, amount) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET balance = balance + ? WHERE id = ?`,
      [amount, userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

module.exports = {
  db,
  initDatabase,
  addUser,
  findUserByUsername,
  findUserByEmail,
  updateNickname,
  updatePassword,
  updateBalance
};