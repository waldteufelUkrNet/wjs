let arrH = [
  {"name":"checkbox","source":"checkbox"},
  {"name":"id","buttons":["search","close","sort"],"source":"id"},
  {"name":"Клиент","buttons":["search","close","sort"],"source":"clientName"},
  {"name":"Login","buttons":["close","sort","menu"],"source":"networkStatus"},
  {"name":"Статус","buttons":["close","sort","menu"],"source":"status"},
  {"name":"Спец.Статус","buttons":["close","sort","menu"],"source":"specStatus"},
  {"name":"Телефон","buttons":["search","close","sort"],"source":"phone"},
  {"name":"Почта","buttons":["search","close","sort"],"source":"email"},
  {"name":"Компания (афилят)","buttons":["close","sort","menu"],"source":"company"},
  {"name":"Брокер","buttons":["close","sort","menu"],"source":"broker"},
  {"name":"Должность брокера","buttons":["close","sort","menu"],"source":"brokerPosition"},
  {"name":"Команда брокера","buttons":["close","sort","menu"],"source":"brockerTeam"},
  {"name":"Тип платформы","buttons":["close","sort","menu"],"source":"platform"},
  {"name":"Верификация","buttons":["close","sort","menu"],"source":"verification"},
  {"name":"Страна","buttons":["close","sort","menu"],"source":"country"},
  {"name":"Язык","buttons":["close","sort","menu"],"source":"language"},
  {"name":"Наличие депозитов","buttons":["close","sort","menu"],"source":"deposits"},
  {"name":"Баланс","buttons":["close","sort","menu"],"source":"money"},
  {"name":"Валюта","buttons":["close","sort","menu"],"source":"currency"},
  {"name":"Активность","buttons":["close","sort","menu"],"source":"activity"},
  {"name":"Последняя активность","buttons":["close","sort","menu"],"source":"lastActivity"},
  {"name":"Возможность торговли","buttons":["close","sort","menu"],"source":"isTradeAble"},
  {"name":"Дата регистрации","buttons":["close","sort","menu"],"source":"dateRegistration"},
  {"name":"Дата последней заметки","buttons":["close","sort","menu"],"source":"dateLastNote"},
  {"name":"Последняя заметка","buttons":["close","sort","menu"],"source":"lastNote"},
  {"name":"Тип аккаунта","buttons":["close","sort","menu"],"source":"accountType"}];
let strH = JSON.stringify(arrH);
console.log("strH", strH);