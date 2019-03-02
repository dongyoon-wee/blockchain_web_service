const SHA256 = require('crypto-js/sha256');
const BlockRootPath = "/block";
const DBPath = './blockchain_db';
const DBController = require('./level_controller.js')(DBPath);


class Block {
	constructor(data){
		this.hash = "";
		this.height = 0;
		this.body = data;
		this.time = new Date().getTime().toString().slice(0,-3);
		this.previousBlockHash = "";
	}
}


class BlockchainController {
    constructor(app) {
        this.app = app;
        this.getBlockByInder();
        this.postNewBlock();
    }
    getBlockByInder() {
        this.app.get(BlockRootPath + '/:index', (req, res) => {
            let i = req.param('index');
            DBController.getLevelDBData(i).then((block) => {
                res.send(block.toString());
            }).catch((err) => {
                res.send(err);
            });
        });
    }
    postNewBlock() {
        this.app.post(BlockRootPath, (req, res) => {
            if (req.query.hasOwnProperty('data')) {
                let data = req.query['data'];
                let chainLength = 0;
                let newBlock = new Block(data);
                DBController.getDBLength().then((result) => {
                    chainLength = result;
                    newBlock.height = chainLength;
                    newBlock.hash = SHA256(JSON.stringify(data)).toString();
                    let previousBlockHash = "";
                    if (chainLength > 0) {
                        DBController.getLevelDBData(chainLength - 1).then((prevBlock) => {
                            newBlock.previousBlockHash = JSON.parse(prevBlock).hash;
                            let newBlockString = JSON.stringify(newBlock).toString();
                            DBController.addLevelDBData(chainLength, newBlockString).then((value) => {
                                res.send(value);
                            }).catch((err) => {
                                res.send(err);
                            });
                        }).catch((err) => {
                            res.send(err)
                        });
                    }
                    else {
                        let newBlockString = JSON.stringify(newBlock).toString();
                        DBController.addLevelDBData(chainLength, newBlockString).then((value) => {
                            res.send(value);
                        }).catch((err) => {
                            res.send(err);
                        });
                    }
                }).catch((err) => {
                    res.send(err.toString());
                });
            }
            else {
                res.send('error: data is empty');
            }
        });
    }
}

module.exports = (app) => { return new BlockchainController(app);};