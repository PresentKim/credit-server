const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const config = require('../config.json');

const toLowerCaseKeys = (obj) => Object.keys(obj).reduce((result, key) => {
    result[key.toLowerCase()] = obj[key];
    return result;
}, {});

class User {
    /**
     * @param id            string  (varchar2(20) PRIMARY KEY)
     * @param pw            string  (varchar2(100))
     * @param name          string  (varchar2(20)
     * @param credit        int     (number(10))
     * @param salt          string  (varchar2(20)
     * @param token         string  (varchar2(100))
     * @param last_update   Date   (timestamp(0))
     */
    constructor({id, pw = null, name, credit = 0, salt = null, token = null, last_update = null}) {
        this.id = id;
        this.pw = pw === null ? crypto.randomBytes(16).toString('hex') : pw;
        this.name = name;
        this.credit = credit;
        this.salt = salt === null ? crypto.randomBytes(16).toString('hex') : salt;
        if (token === null) {
            this.resetToken();
        } else {
            this.token = token;
        }
        this.last_update = last_update ? new Date(last_update) : new Date();
    }

    setPassword(rawPw) {
        this.pw = crypto.pbkdf2Sync(rawPw, this.salt,
            1000, 64, `sha512`).toString('hex');
    }

    resetToken() {
        return this.token = jwt.sign({id: this.id, salt: crypto.randomBytes(16).toString('hex')}, config.JWT_KEY);
    }

    toBindParameter() {
        return {
            id: this.id,
            pw: this.pw,
            name: this.name,
            credit: this.credit,
            salt: this.salt,
            token: this.token,
            last_update: this.last_update
        };
    }

    save = async () => {
        let connection = await db.getConnection();
        const sql = `UPDATE credit_user SET pw = :pw, name = :name, credit = :credit, token = :token, salt = :salt, last_update = :last_update WHERE id = :id`;
        await connection.execute(sql, this.toBindParameter(), {autoCommit: true});
    }

    static fromData = async ({ID, PW, NAME, CREDIT, SALT, TOKEN, LAST_UPDATE}) => {
        return new User({});
    }

    static create = async (id, password, name, credit = 0,) => {
        if (await User.getRowById(id))
            throw new Error("Already used id");

        let user = new User({id, name, credit});
        user.setPassword(password);

        try {
            let connection = await db.getConnection();
            const sql = `INSERT INTO credit_user VALUES (:id, :pw, :name, :credit, :token, :salt, :last_update)`;
            await connection.execute(sql, user.toBindParameter(), {autoCommit: true});
            await connection.close();
        } catch (error) {
            throw new Error("Database access failure");
        }

        return user;
    }

    static findByToken = async (id, token) => {
        let data = await User.getRowById(id);
        if (data === null)
            throw new Error("No data found");

        if (data.token !== token)
            return null;

        return new User(data);
    }

    static findByPassword = async (id, rawPW) => {
        let data = await User.getRowById(id);
        const pw = crypto.pbkdf2Sync(rawPW, data.salt, 1000, 64, `sha512`).toString(`hex`);
        if (data.pw !== pw)
            return null;

        return new User(data);
    }

    static getRowById = async (id) => {
        let result;
        try {
            let connection = await db.getConnection();
            const sql = `SELECT * FROM credit_user WHERE id = :id`;
            result = await connection.execute(sql, [id], {outFormat: db.OUT_FORMAT_OBJECT});
            await connection.close();
        } catch (error) {
            throw new Error("Database access failure");
        }
        if (result.rows.length === 0)
            return null;

        return toLowerCaseKeys(result.rows[0]);
    }
}

module.exports = User;