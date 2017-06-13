/**
 * @file ajax
 */


import request from 'superagent-bluebird-promise';
import nocache from 'superagent-no-cache';

let defaultHeader = {
    Accept: 'application/json'
};

import urlUtils from './urlUtils';

/**
 * 用于从 data 转化为 query string 的 util
 *
 * @param {Object} data 传入的参数
 * @param {string} url 地址
 * @return {string}
 */
function getParamStr(data, url) {
    let q = [];
    let qstr = '';
    for (let key in data) {
        q.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    if (q.length) {
        qstr = (url.indexOf('?') === -1 ? '?' : '&') + q.join('&');
    }
    return qstr;
}

/**
 * 基础的 ajaxAgent 方法
 *
 * @param {string} method get/post
 * @param {string} url 地址
 * @param {Object} options 选项
 * @return {Promise.<TResult>}
 */
function agent(method, url, options = {}) {
    let {
        // 用于设置额外的 header
        header,

        data = {},
        genericSuccessHandler,
        genericErrorHandler,

        isJSON = true,
        isRawURL = false
    } = options;

    url = isRawURL ? url : urlUtils.api(url);
    if (method === 'get') {
        url = url + getParamStr(data, url);
        data = {};
    }

    // 用于记录当前所有 pending 的 ajax 请求
    agent.pending++;

    let requestHandler = request(method, url)
        .set(Object.assign({}, defaultHeader, header))
        .use(nocache)
        .send(data)
        .then(response => (agent.pending--, response))
        // 用于处理通用 success handler 与 error handler
        .then(genericSuccessHandler || (x => x), genericErrorHandler || (x => undefined));

    if (isJSON) {
        requestHandler = requestHandler.then(response => JSON.parse(response.text));
    }

    return requestHandler;
}

agent.pending = 0;

export default agent;