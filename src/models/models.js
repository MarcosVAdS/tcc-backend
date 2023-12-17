const sqlite3 = require('sqlite3').verbose()
const dayjs = require('dayjs')
const path = require('path');
const db = new sqlite3.Database(':memory:')

const database = path.resolve(__dirname, '../db/database.db')

class Purchases {
    constructor(id, product, value, created_at = null) {
        this.id = id
        this.product = product
        this.value = value
        this.created_at = created_at || dayjs().format()
    }

    static createTable() {
        const db = new sqlite3.Database(database)

        db.run(
            `CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            value TEXT,
            created_at TEXT
            )`
        )

        db.close()
    }

    static insert(purchase, callback) {
        const db = new sqlite3.Database(database)

        db.run(
        'INSERT INTO purchases (product, value, created_at) VALUES (?, ?, ?)',
        [purchase.product, purchase.value, purchase.created_at], function(error) {
                if(error) {
                    console.error(error.message)
                } else {
                    console.log(`Purchase added with Id: ${this.lastID}`)
                    purchase.id = this.lastID
                }
                callback(error, purchase)
            }
        )
        db.close()
    }

    static select(callback) {
        const db = new sqlite3.Database(database);
        db.all('SELECT * FROM purchases', (err, rows) => {
          callback(err, rows);
        });
        db.close();
    }
}

module.exports = Purchases