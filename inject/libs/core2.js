const Provider = require('../provider/index');
const Decimal = require('decimal.js');

class Temp {

    /*
    window.Bee = {
        'session':{'url':'','chain':'bnb'},
        'account': {'bnb': {'address': '0x03F5E6eC887f89fB8673BF9266E1d2a0e24EDB48'}},
        'chain': {'bnb': {'rpcURL': 'https://bsc-dataseed1.defibit.io', 'chainId': '56'}},
        'appid': '',
        'appkey': '',
        'license': '',
        'version': '1.4.0'
        }
     */
    //{address, rpcURL}
    constructor(account, chain) {
       this.reset(account,chain);
    }

    reset(account,chain){
        try {
            chain.chainId = new Decimal(chain.chainId).toNumber();
        } catch (e) {
            chain.chainId=1;
        }
        if (account.address){ account.address = account.address.toLowerCase()}
        const config = {
            address: account.address,
            chainId: chain.chainId,
            rpcUrl: chain.rpcURL,
            isDebug:true,
        };
        if (!this.provider){
            const provider = new Provider(config);
            provider.postMessage = this.bind(function (handler, id, data) {
                console.log(`----------[${config.chainId}] provider.postMessage----------`, JSON.stringify(data),handler,id)
                if (this[handler]) {
                    this[handler](id, data);
                } else {
                    console.error(`[${config.chainId}] Not support: `, arguments);
                }
            }, this);
            this.provider = provider;
            window.ethereum = provider;
            window.isMetaMask = true;
        }else{
            this.provider.setConfig(config);
            this.provider.emitChainChanged(this.provider.chainId);
        }
    }

    bind(fun) {
        let _this = arguments[1], args = [];
        for (let i = 2, il = arguments.length; i < il; i++) {
            args.push(arguments[i]);
        }
        return function () {
            let thisArgs = args.concat();
            for (let i = 0, il = arguments.length; i < il; i++) {
                thisArgs.push(arguments[i]);
            }
            return fun.apply(_this || this, thisArgs);
        }
    }

    post(cmd, id, data,callback) {
        __jHost(cmd, this.provider.chainId, JSON.stringify(data), this.bind(function (err, reply) {
            if (callback){
                callback(id,err,reply);
            }else{
                if (err) {
                    this.provider.sendError(id, err);
                } else {
                    //alert(reply)
                    this.provider.sendResponse(id, reply);
                }
            }
            return false;
        }, this));
    }

    requestAccounts(id, data) {
        this.provider.sendResponse(id, [this.provider.address]);
    }

    signTransaction(id, data) {
        this.post('signTransaction', id, data);
    }


    signMessage(id, data) {
        this.post('signMessage', id, data);
    }

    signPersonalMessage(id, data) {
        this.post('signPersonalMessage', id, data);
    }

    signTypedMessage(id, data) {
        this.post('signTypedMessage', id, data);
    }
    ecRecover(id, data) {
        this.post('ecRecover', id, data);
    }

    addEthereumChain(id,data){
        this.post('addEthereumChain', id, data,(id,err,reply)=>{
            if (err) {
                this.provider.sendError(id, err);
            } else {
                //alert(reply)
                this.provider.sendResponse(id, reply);
            }

        });
    }
    switchEthereumChain(id,data){
        this.post('switchEthereumChain', id, data,(id,err,reply)=>{
            if (err) {
                this.provider.sendError(id, err);
            } else {
                //alert(reply)
                this.provider.sendResponse(id, reply);
            }

        });
    }
}

module.exports = Temp;
