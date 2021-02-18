'use strict'

/* ↓↓↓ functions declaration ↓↓↓ */
  /**
   * [addOnEventToObject додає циклом on-обробники в масив або об'єкт елементів,
   * передає контекст у обробник]
   * @param {[String]}       event     [назва події]
   * @param {[Object/Array]} targetObj [сукупність DOM-елементів]
   * @param {[Function]}     handler   [функція-обробник]
   */
  function addOnEventToObject(event, targetObj, handler) {
    let e = 'on' + event;
    for (let i = 0; i < targetObj.length; i++) {
      (function(n){
        targetObj[n][e] = function() {
          handler(this);
        };
      }(i));
    }
  }

  /**
   * [addEventListenerToObject додає циклом обробники в масив/об'єкт елементів]
   * @param {[String]}       event     [назва події]
   * @param {[Object/Array]} targetObj [сукупність DOM-елементів]
   * @param {[Function]}     handler   [функція-обробник]
   */
  function addEventListenerToObject(event, targetObj, handler) {
    for ( let i = 0; i < targetObj.length; i++ ) {
      (function(n){
        targetObj[n].addEventListener(event, handler);
      }(i));
    }
  }

  /**
   * [randomInteger повертає цілі числа із заданого діапазону]
   * @param {[Number]} min [нижня межа діапазону]
   * @param {[Number]} max [верхня межа діапазону]
   * @return {[Number]} [результат випадковості]
   */
  function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////