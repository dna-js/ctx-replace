/*
 * @Author: magmaliang
 * @Date: 2019-03-27 16:30:27 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-03-27 17:23:41
 */

 /**
  * get object from query at the end of hash
  */
const getHashQueryObj = () => {
  const hashList = window.location.hash.split("?")
  let query = hashList.length > 2 ? window.location.hash.split("?")[1] : false;

  if (query) {
    let obj = {};
    query.split("&").map(x=>{
      let t = x.split('=');
      obj[t[0]] = t[1];
    });
    return obj;
  }

  return {};
};

function  CtxReplace(options) {
  this.discardFailureReplace = true;
  this.warning = false;
  Object.assign(this, options);
}

Object.assign(CtxReplace.prototype, {
  contextFill: function (string, ctx, pctx = {}) {
    let fillSuccess = true; // 是否转换彻底
    // 替换父级上下文
    let matched = string.match(/\$\{(.)*?\}/g);
    if (matched) {
      matched.forEach(x=>{
        let tartgetField = pctx[x.replace(/\$|\{|\}/g, '')];
        if (tartgetField !== undefined) {
          string = string.replace(x, tartgetField);
        }
      });
    }
    /**
     *  替换当前上下文
     *  变量从formData和location query中替换
     *  formData和location query同时存在，取formData
     */

    matched = string.match(/\{(.)*?\}/g);
    if (matched) {
      const query = Object.assign(getHashQueryObj(), ctx)
      matched.forEach(x=>{
        let tartgetField = query[x.replace(/\{|\}/g, '')];
        if (tartgetField !== undefined) {
          string = string.replace(x, tartgetField);
        }
      });
    }
  
    matched = string.match(/\$\{(.)*?\}/g) || string.match(/\{(.)*?\}/g);
  
    if (matched) {
      this._logWarningMsg(`字符串转换失败：${string}， 后续请求可能不会执行！`);
      fillSuccess = false;
    }

    // 是否将match失败的字段移除
    if (this.discardFailureReplace) {
      matched = string.match(/&?\w+?=\{(.)*?\}/g);
      matched && matched.forEach(x => {
        string = string.replace(x, '');
      });
    }
  
    return {value: string, url: string, fillSuccess};
  },
  _logWarningMsg: function(msg) {
    this.warning && console.warn(msg);
  },
  getUrlFromUrlObj: function (urlObj, ctx, force = false) {
    if (force) {
      if (typeof urlObj === 'string') {
        return this.contextFill(urlObj, ctx);
      }
      return this.contextFill(urlObj.url, ctx);
    } else {
      if (typeof urlObj === 'string') {
        return this.contextFill(urlObj, ctx);
      }
    
      return this.contextFill(urlObj.url, ctx);
    }
  },
  getUrl: function({urlObj, ctx, force, pctx} = {force: false, ctx: {}, pctx: {}}) {
    if (force) {
      if (typeof urlObj === 'string') {
        return this.contextFill(urlObj, ctx, pctx);
      }
      return this.contextFill(urlObj.url, ctx, pctx);
    } else {
      if (typeof urlObj === 'string') {
        return this.contextFill(urlObj, ctx, pctx);
      }
    
      return this.contextFill(urlObj.url, ctx, pctx);
    }
  }
}) 

const ctxReplace = new CtxReplace();

module.exports.ctxReplace = ctxReplace;