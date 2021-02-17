"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ wDataBaseTable ↓↓↓ */
  // коли даних в таблиці забагато, .wjs-dbtable__table-wrapper випадає за межі
  // .wjs-dbtable, в результаті не видно прокрутки. Потрібно розраховувати висоту
  // .wjs-dbtable__table-wrapper
  document.addEventListener('DOMContentLoaded', function(){

    // це тимчасова змінна для емуляції відповіді на запит про побудову заголовків
    let arr = [
      {
        position : 0,
        name     : "checkbox"
      },{
        position : 1,
        name     : "id",
        buttons  : ["search", "close", "sort"]
      },{
        position : 2,
        name     : "Клиент",
        buttons  : ["search", "close", "sort"]
      },{
        position : 3,
        name     : "Login",
        buttons  : ["search", "close", "sort", "menu"]
      },{
        position : 4,
        name     : "Статус",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 5,
        name     : "Спец.Статус",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 6,
        name     : "Телефон",
        buttons  : ["search", "close", "sort"]
      },{
        position : 7,
        name     : "Почта",
        buttons  : ["search", "close", "sort"]
      },{
        position : 8,
        name     : "Компания (афилят)",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 9,
        name     : "Брокер",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 10,
        name     : "Должность брокера",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 11,
        name     : "Команда брокера",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 12,
        name     : "Тип платформы",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 13,
        name     : "Верификация",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 14,
        name     : "Страна",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 15,
        name     : "Язык",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 16,
        name     : "Наличие депозитов",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 17,
        name     : "Баланс",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 18,
        name     : "Валюта",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 19,
        name     : "Активность",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 20,
        name     : "Последняя активность",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 21,
        name     : "Возможность торговли",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 22,
        name     : "Дата регистрации",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 23,
        name     : "Дата последней заметки",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 24,
        name     : "Последняя заметка",
        buttons  : ["close", "sort", "menu"]
      },{
        position : 25,
        name     : "Тип аккаунта",
        buttons  : ["close", "sort", "menu"]
      }
    ];
    let str = JSON.stringify(arr);
    buildTableHeader('clientTable', str);


    calculateTableCellsWidth( document.querySelector('#clientTable') );

    setTableWrapperMaxAviableHeight();
    setTableInnerMaxAviableHeight();
    wSetScroll( document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});
    wSetScroll( document.querySelector('#clientTable .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});
    positioningOfInnerRightScroll();
  });

  window.addEventListener('resize', positioningOfInnerRightScroll);
  window.addEventListener('resize', setTableInnerMaxAviableHeight);
/* ↑↑↑ wDataBaseTable ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */
/**
 * [wSetScroll відповідає за кастомну прокрутку:
 * 1. зчитує з атрибутів елемента, які прокрутки потрібно додати,
 * 2. слідкує за прокруткою елемента і поправляє положення повзунків прокрутки
 * 3. слідкує за положенням повзунків прокрутки і поправляє прокрутку елемента]
 * @param {[DOM-object]} elem [елемент DOM з класом .wjs-scroll]
 * @param {[object]} params [набір налаштувань для одиночного запуску функції
 * формат даних: {top:boolean, bottom:boolean, left:boolean, right:boolean,
 * overflowXHidden:boolean, overvlowYHidden:boolean}]
 */
function wFoo(elem, params = {}) {}



function calculateTableCellsWidth(tableElement) {
  if (!tableElement) return;

  let headers = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
      cells   = tableElement.querySelectorAll('.wjs-dbtable__body-cell'),
      theader = tableElement.querySelector('.wjs-dbtable__theader'),
      tbody   = tableElement.querySelector('.wjs-dbtable__tbody');

  let countWidth = 0;

  for (let i = 0; i < headers.length; i++) {
    if (headers[i].clientWidth > cells[i].clientWidth) {
      cells[i].style.cssText = 'width:' + headers[i].offsetWidth + 'px';
      headers[i].style.cssText = 'width:' + headers[i].offsetWidth + 'px';
    } else {
      cells[i].style.cssText = 'width:' + cells[i].offsetWidth + 'px';
      headers[i].style.cssText = 'width:' + cells[i].offsetWidth + 'px';
    }
    countWidth += headers[i].offsetWidth;
  }

  theader.style.cssText = 'width:' + countWidth + 'px';
  tbody.style.cssText = 'width:' + countWidth + 'px';
}

function setTableWrapperMaxAviableHeight() {

  let elem = document.querySelector('#clientTable .wjs-dbtable__table-wrapper');

  let parent = elem.parentElement;
  let aviableHeight = parent.clientHeight
                      - +getComputedStyle(parent).paddingTop.slice(0,-2)
                      - +getComputedStyle(parent).paddingBottom.slice(0,-2);
  let elemSiblings = parent.children;
  if (elemSiblings.length == 1) {
    // елемент один і займає весь простір
    elem.style.height = aviableHeight + 'px';
  } else {
    // елемент не один, розраховуємо досупну для нього висоту
    for (let i = 0; i < elemSiblings.length; i++) {
      if (elemSiblings[i] == elem) continue;
      aviableHeight -= elemSiblings[i].clientHeight;
    }

    for (let i = 0; i < elemSiblings.length; i++) {
      if (elemSiblings[i-1]) {
        if ( +getComputedStyle(elemSiblings[i-1]).marginBottom.slice(0,-2) > +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2) ) {
          aviableHeight -= +getComputedStyle(elemSiblings[i-1]).marginBottom.slice(0,-2);
        } else {
          aviableHeight -= +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2);
        }
      } else {
        aviableHeight -= +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2);
      }
    }
    aviableHeight -= +getComputedStyle(elemSiblings[elemSiblings.length-1]).marginBottom.slice(0,-2);

    elem.style.height = aviableHeight + 'px';
  }
}

function setTableInnerMaxAviableHeight() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll');
  let height = document.querySelector('#clientTable .wjs-dbtable__table-wrapper').clientHeight
               - document.querySelector('#clientTable .wjs-dbtable__theader').offsetHeight
               - getComputedStyle( document.querySelector('#clientTable .wjs-dbtable__table-wrapper .wjs-scroll__content') ).paddingBottom.slice(0,-2);

  let width = document.querySelector('#clientTable .wjs-dbtable__tbody').offsetWidth;

  elem.style.height = height + 'px';
  elem.style.width = width + 'px';

}

function positioningOfInnerRightScroll() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__wrapper_right');

  let container = document.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll');
  elem.style.left =  container.clientWidth - elem.offsetWidth + 'px';

  container.querySelector('.wjs-scroll__content').addEventListener('scroll', foo);
  function foo(event) {
    elem.style.left =  container.clientWidth - elem.offsetWidth + event.target.scrollLeft + 'px';
  }
}

function buildTableHeader (tableID, data) {
  let dataArr = JSON.parse(data);

  let table = document.querySelector('#' + tableID);
  let header = table.querySelector('.wjs-dbtable__theader');
  // header.innerHTML = '';

  let htmlStr = '';
  for (let item of dataArr ) {
    if (item.name == 'checkbox') {
      htmlStr += '\
                    <div class="wjs-dbtable__header-cell">\
                      <div class="wjs-dbtable__th-name">\
                        <input type="checkbox">\
                      </div>\
                    </div>\
                 ';
    } else {

      htmlStr += '<div class="wjs-dbtable__header-cell">';

      if ( item.buttons && item.buttons.includes('search') ) {
        htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_search" type="button" title="поиск в базе по полю"></button>';
      }

      htmlStr += '<div class="wjs-dbtable__th-name">' + item.name + '</div>';

      if ( item.buttons && ( item.buttons.includes('close')
                             || item.buttons.includes('sort')
                             || item.buttons.includes('menu') ) ) {
        htmlStr += '<div class="wjs-dbtable__theader-btns-group">';

        if ( item.buttons.includes('close') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_close" type="button" title="спрятать колонку"></button>';
        }
        if ( item.buttons.includes('sort') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_sort" type="button" title="сортировать базу данных по полю"></button>';
        }
        if ( item.buttons.includes('menu') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_options" type="button" title="доп. опции"></button>';
        }
        htmlStr += '</div>';
      }

      htmlStr += '</div>';

    }
  }
  header.innerHTML = htmlStr;
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////