"use strict";
/* ↓↓↓ functions declaration ↓↓↓ */

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