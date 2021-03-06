"use strict";
// AJAX
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */
  /**
   * [ajax створює асинхронний запит і отриманий результат перенаправляє
   * функції-обробнику]
   * @param  {[String]} url      [адреса запиту]
   * @param  {[String]} method   [метод запиту: get/post]
   * @param  {Function} callback [функція-обробник результату запиту]
   */
  function ajax(url, method, callback, ...args) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText, ...args);
      }
    }
    xhttp.open(method, url, true);
    xhttp.send();
  }

  /**
   * [ajaxPost відправляє дані на сервер post-запитом, у разі успіху запускає
   * функцію-коллбек]
   * @param  {[String]}        url         [адреса]
   * @param  {[String/Object]} data        [дані для відправки]
   * @param  {[Function]}      successFunc [функція-callback]
   * @param  {[DOM-Object]}    context     [контекст для функції]
   */
  function ajaxPost(url, data, successFunc, context) {
    // console.log("url", url);
    // console.log("data", data);
    // console.log("successFunc", successFunc);
    // console.log("context", context);
    // successFunc(context);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        successFunc(context);
      }
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send( JSON.stringify(data) );
  }
/* ↑↑↑ /functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////