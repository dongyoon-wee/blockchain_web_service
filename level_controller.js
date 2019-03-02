const level = require('level');


class LevelController {
    constructor(db_path) {
        this.db_path = db_path;
        this.db = level(this.db_path);
    }
    addLevelDBData(key, value){
        let db = this.db;
        return new Promise(function(resolve, reject){
            db.put(key, value, (err) => {
                if (err) reject(err);
                resolve(value);
            })
        });
    }
    getLevelDBData(key){
        var db = this.db;
        return new Promise(function(resolve, reject){
            db.get(key, (err, value) => {
                if (err) return reject(err);
                resolve(value);
            })
        });
    }
    getDBLength() {
        let count = 0;
        var db = this.db;

        return new Promise(function(resolve, reject){
            db.createReadStream().on('data', function () {
                count++;
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('close', function () {
                resolve(count);
            });
        });
    }
}


module.exports = (db_path) => {return new LevelController(db_path);};