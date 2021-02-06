"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ прокручувана таблиця з фіксованою шапкою ↓↓↓ */
  let scrollTables = document.querySelectorAll('.wjs-scrollTable-wrapper');

  // навішування обробника через цикл, з передачею контексту
  for (let i = 0; i < scrollTables.length; i++) {
    (function(n, domObj){
      scrollTables[n].onscroll = function() {
        scrollTableHandler(domObj);
      };
    }(i, scrollTables[i]));
  }
/* ↑↑↑ /прокручувана таблиця з фіксованою шапкою ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */

  /**
   * [ajax створює асинхронний запит і отриманий результат перенаправляє
   * функції-обробнику]
   * @param  {[String]} url      [адреса запиту]
   * @param  {[String]} method   [метод запиту: get/post]
   * @param  {Function} callback [функція-обробник результату запиту]
   */
  function ajax(url, method, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText);
      }
    }
    xhttp.open(method, url, true);
    xhttp.send();
  }

/**
 * [scrollTableHandler встановлює зміщення шапки таблиці відповідно до прокрутки
 * таблиці так, щоб шапка була завжди нагорі]
 * @param  {[DOM-object]} eventTarget [прокручувана обгортка таблиці]
 */
function scrollTableHandler(eventTarget) {
  let scrollTop = eventTarget.scrollTop;
  eventTarget.querySelector('thead').style.transform = 'translateY('    +
                                                        (scrollTop - 1) +
                                                        'px)';
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////








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

  /**
   * [checkPhoneKey відфільтровує усі клавіші крім цифрових, стрілок та видалень]
   * @param  {[Object]} event [об'єкт події]
   * @return {[Boolean]}      [результат фільтрації]
   */
  function checkPhoneKey(event) {
    return (event.key >= '0' && event.key <= '9') ||
                        event.key == 'ArrowLeft'  ||
                        event.key == 'ArrowRight' ||
                        event.key == 'Delete'     ||
                        event.key == 'Backspace';
  }

  /**
   * [isEmailValid перевіряє валідність пошти]
   * @param  {[string]}  email [пошта, яку валідують]
   * @return {Boolean}         [результат перевірки на валідність]
   */
  function isEmailValid(email) {
    // повинен бути 1 символ @
    let temp = calculateCharsInStr(email, '@');
    if (temp != 1) return false;

    // повинен бути мінімум 1 символ .
    temp = calculateCharsInStr(email, '.');
    if (temp < 1) return false;

    // символи @ та . не повинні бути крайніми
    if (email.charAt(0) == '@' ||
        email.charAt(0) == '.' ||
        email.charAt(email.length - 1) == '@' ||
        email.charAt(email.length - 1) == '.') return false;

    // комбінація символів @. не допустима
    if (email.indexOf('@.') != -1) return false;

    // після символу @ обов'язково повинен бути символ .
    let tempArr = email.split('@');
    if (tempArr[1].indexOf('.') == -1) return false;
    return true;
  }

  /**
   * [calculateCharsInStr розраховує кількість символів одного типу в рядку]
   * @param  {[string]} str  [рядок, в якому проводиться пошук]
   * @param  {[string]} char [шуканий символ]
   * @return {[number]}      [кількість символів одного типу в рядку]
   */
  function calculateCharsInStr(str, char) {
    let pos = 0,
        count = 0;

    while (true) {
      let foundPos = str.indexOf(char, pos);
      if (foundPos == -1) break;
      count++;
      pos = foundPos + 1;
    }

    return count;
  }

  /**
   * [isNumeric визначає, чи є передаваний параметр числом]
   * @param  {[string]}  n [значення, яке треба визначити як число/не число]
   * @return {Boolean}     [результат перевірки]
   */
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * [redirect перенаправляє на сторінку, вказану в параметрі]
   * @param  {[string]} url [адреса]
   */
  function redirect(url) {
    window.location.href = url;
  }
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////