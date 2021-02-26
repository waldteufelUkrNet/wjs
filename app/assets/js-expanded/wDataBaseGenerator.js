'use strict'

// let arrB = [
//   {
//     checkbox         : true,
//     id               : 1,
//     clientName       : 'Rudy Malocha',//Клиент
//     networkStatus    : 'offline',//Login
//     status           : 'new',//Статус
//     specStatus       : 'sstatus1',//Спец.Статус
//     phone            : '79061234567',//Телефон
//     email            : 'trimeter@antiguan.edu',//Почта
//     company          : '',//Компания (афилят)
//     broker           : '',//Брокер            |
//     brokerPosition   : '',//Должность брокера |
//     brokerTeam      : '',//Команда брокера   |
//     platform         : '',//Тип платформы
//     verification     : '',//Верификация
//     country          : '',//Страна
//     language         : '',//Язык
//     deposits         : '',//Наличие депозитов
//     money            : '',//Баланс
//     currency         : '',//Валюта
//     activity         : '',//Активность
//     lastActivity     : '',//Последняя активность
//     isTradeAble      : '',//Возможность торговли
//     dateRegistration : '',//Дата регистрации
//     dateLastNote     : '',//Дата последней заметки
//     lastNote         : '',//Последняя заметка
//     accountType      : '' //Тип аккаунта
//   }
// ];

let firstNameArr       = ['Leeanna','Earlie','Shawn','Adah','Necole','Rosette','Mariette','Merlyn','Quincy','Claudette','Melissia','Ariel','Nathalie','Bernarda','Dedra','Kristle','Chong','Yan','Ervin','Antonia','Janna','Felicia','Norma','Mike','Ali','Jaclyn','Delilah','Latashia','Elda','Vashti','Genevive','Tyrone','Nereida','Aleen','Lillia','Kareen','Shauna','Shara','Wesley','Mikaela','Rachele','Anabel','Sidney','Francesca','Janine','Fiona','Richelle','Garrett','Jeromy','Taryn','August','Bette','Wendi','Andrea','Neoma','Williemae','Merle','Ursula','Earleen','Zack','Ismael','Myung','Dylan','Mickey','Reggie','Harmony','Deanne','Sylvester','Rudolph','Rochell','Lisandra','Griselda','Lawrence','Colette','Heidi','Chas','Kris','Stacy','Marlon','Bobbye','Margarito','Ardell','Lynn','Margarett','Jeanie','Margareta','Vito','Edythe','Ismael','Tomas','Elouise','Monnie','Korey','Yoko','Wendolyn','Amelia','Moriah','Glory','Buena','Joann'];
let lastNameArr        = ['Gills', 'Bulgrin', 'Maddy', 'Bonomini', 'Zahradnik', 'Melbourne', 'Bekhit', 'Radley', 'Thor', 'Terrel', 'Bustad', 'Sleeth', 'Boccella', 'Ivins', 'Swainston', 'Jarrette', 'Abram', 'Aquas', 'Rubenfeld', 'Wattenbarger', 'Lattrell', 'Ren', 'Filicetti', 'Billick', 'Bookwalter', 'Tibbets', 'Uzzo', 'Rorer', 'Stephan', 'Boespflug', 'Martos', 'Katowicz', 'Metler', 'Volmer', 'Echegoyen', 'Mulvey', 'Rogacki', 'Roarx', 'Vogtlin', 'Kesselring', 'Soifer', 'Geml', 'Ciotta', 'Heffelbower', 'Burnett', 'Pafel', 'Woitowitz', 'Papalia', 'Barratt', 'Moyd', 'Daer', 'Helmbrecht', 'Holloway', 'Langhout', 'Eversmann', 'Nein', 'Buchann', 'Stacer', 'Ihde', 'Hano', 'Weitzel', 'Biegler', 'Loving', 'Koestler', 'Lokhmatov', 'Gdula', 'Cheser', 'Oderkirk', 'Loo', 'Papalia', 'Oerther', 'Suomela', 'Chermak', 'Schloemer', 'Reeve', 'Fangman', 'Wuori', 'Scariano', 'Robarge', 'Sedillo', 'Bissette', 'Thoresen', 'Rosenbaum', 'Fournet', 'Grumet', 'Bellville', 'Sutten', 'Goetzinger', 'Stirling', 'Brunelle', 'Laeger', 'Wilczak', 'Deane', 'Hosmer', 'Verna', 'Bretz','Brookshire', 'Chauvin', 'Schunemann', 'Wesley'];
let networkStatusArr   = ['offline', 'online'];
let statusArr          = ['New', 'Fraud', 'Charge Backs', 'Refund', 'Not intrested', 'Call back', 'In progress', 'No answer', 'No answer1', 'No answer2', 'No answer3', 'No answer4', 'No answer5', 'Pre deposit', 'Замена', 'No ansver 15', 'comission', 'VIP', 'Мусор Сейлов', 'Мусор Ретена', 'Depositor'];
let specStatusArr      = ['new', 'sstatus1', 'sstatus2'];
let emailDomainArr     = ['nurhag.co.uk', 'untwist.co.uk', 'intercomplexity.edu', 'unstuccoed.com', 'tresslike.net', 'emit.edu', 'gazingly.edu', 'dental.com', 'bushrope.edu', 'belyingly.edu', 'schistothorax.net', 'injuriousness.edu', 'cordaitaceae.net', 'unambitious.net', 'narr.net', 'cephalanthium.edu', 'urethroblennorrhea.org', 'nonzonate.com', 'overawful.edu', 'coprolalia.org', 'oligodendroglia.co.uk', 'abiezer.org', 'excessive.net', 'supercharger.org', 'noninclusion.net', 'pushing.co.uk', 'rabbinistical.edu', 'florinda.co.uk', 'altitude.edu', 'aphrasia.com', 'photovitrotype.co.uk', 'nondilution.com', 'multisaccate.org', 'digonous.edu', 'pharyngoscopy.net', 'loathfulness.co.uk', 'pearlwort.co.uk', 'icositetrahedron.edu', 'terreted.com', 'synthesis.co.uk', 'pariglin.org', 'attendantly.com', 'sedimentation.org', 'saddlewise.com', 'anthropic.org', 'tied.co.uk', 'nephelite.net', 'cornless.edu', 'intraligamentous.edu', 'uncallower.edu', 'backfiring.com', 'raindrop.org', 'jestwise.net', 'sagai.org', 'prebeloved.edu', 'alliaceae.edu', 'lectrice.net', 'undecisively.co.uk', 'hydrobates.co.uk', 'extrasolar.com'];
let companyArr         = ['Site Registration', 'TSL', 'Import', 'OneStep2', 'M15', 'M16', 'TON', 'Im_JETsignals', 'J-Signals', 'Commission', 'EU_ALL', 'LeadBolid', 'ARC', 'ORI'];
let platformArr        = ['binary', 'CFD'];
let verificationArr    = ['без верификации', 'частичная верификация', 'полная верификация'];
let countryArr         = ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos", "Colombia", "Comoros", "Congo, Republic Of", "Congo, The Democratic Republic of the (formerly Zaire)", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-bissau", "Guyana", "Haiti", "Heard and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "S. Georgia and S. Sandwich Islands", "Saint Barthelemy", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "United States Of America", "US Minor Outlying Islands", "US Virgin Islands", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"];
let languageArr        = ['русский', 'español', 'English', 'عربية">اللغة العربية<', 'língua portuguesa', 'Deutsch', 'français', 'italiano', 'Türkçe', 'język polski', 'Український', 'limba română', 'Azəricə', 'Nederlands', 'magyar nyelv', 'Ελληνικά', 'čeština'];
let depositArr         = ['с депозитами', 'без депозитов'];
let currencyArr        = ['USD', 'EUR', 'RUB'];
let activityArr        = ['активен', 'не активен']
let isTradePossibleArr = ['доступна', 'не доступна'];
let accountTypeArr     = ['standart','business', 'premium', 'VIP'];
let brokers            = ['Admin Admin', 'Boos Admin', 'Ret Box', 'Sal Box', 'AnastasiaR MillerR', 'Vladislav Medvedev', 'refund refund', 'Max Zakharov', 'trashBox nekrasov', 'temp2 temp2', 'Alexandr Melnikov', 'Daniil Nekrasov', 'Alexander Korolev', 'Yaroslav Zubov', 'Andrey Bykov', 'Yaroslav Gorinin', 'Diana Gornaya', 'drop drop', 'trashBox melnik', 'Egor Kosinskiy', 'Egor Abramov', 'Alexandr Barinov', 'Vlada Safronova', 'Alisa Vershynina', 'Anton Korenev', 'Alena Goeva', 'Roman Kalinin', 'Roman Pronin', 'Monika Kosharikova', 'Alexey Arhipov', 'Denis Gromov', 'Anastasia Miller', 'Igor Kovalev', 'Rostislav Lapin', 'Vladimir Dolotov', 'Vladislav Strelkov', 'Leonid Perov'];
let brokerPosArr       = ['sales','retention'];
let brokerTeamArr      = ['SalesTeam_1', 'SalesTeam_2', 'RetTeam_1', 'RetTeam_2'];
////////////////////////////////////////////////////////////////////////////////

let randomDataBase = [];
let brokersDB = [];


// brokers db generation
for (let i = 0; i < brokers.length; i++) {
  let percent = randomInteger(1,50000);

  let item = {
    name: brokers[i]
  }

  if (0 < percent && percent < 25) {
    item.brokerPosition = brokerPosArr[0];
    item.brokerTeam = brokerTeamArr[0];
  } else if (25 <= percent && percent < 50) {
    item.brokerPosition = brokerPosArr[0];
    item.brokerTeam = brokerTeamArr[1];
  } else if (50 <= percent && percent < 70) {
    item.brokerPosition = brokerPosArr[1];
    item.brokerTeam = brokerTeamArr[2];
  } else {
    item.brokerPosition = brokerPosArr[1];
    item.brokerTeam = brokerTeamArr[3];
  }

  brokersDB.push(item);
}

//  db generation
for (let i = 0; i < 100; i++) {
  let percent = randomInteger(1,100);

  let item = {
    checkbox : true,
    id: i+1
  };

  // clientName
  let fname = firstNameArr[randomInteger(0, firstNameArr.length-1)];
  let lname = lastNameArr[randomInteger(0, lastNameArr.length-1)];
  item.clientName = fname + ' ' + lname;

  // networkStatus
  if ( percent < 15) {
    item.networkStatus = networkStatusArr[1];
  } else {
    item.networkStatus = networkStatusArr[0];
  }

  // status
  item.status = statusArr[randomInteger(0, statusArr.length-1)];

  // specStatus
  item.specStatus = specStatusArr[randomInteger(0, specStatusArr.length-1)];

  // phone
  item.phone = randomInteger(10000000000,99999999999);

  // email
  item.email = fname.toLowerCase()
               + '.'
               + lname.toLowerCase()
               + '@'
               + emailDomainArr[randomInteger(0, emailDomainArr.length-1)];

  // company
  item.company = companyArr[randomInteger(0, companyArr.length-1)];

  // platform
  item.platform = platformArr[randomInteger(0, platformArr.length-1)];

  // verification
  item.verification = verificationArr[randomInteger(0, verificationArr.length-1)];

  // country
  item.country = countryArr[randomInteger(0, countryArr.length-1)];

  // language
  item.language = languageArr[randomInteger(0, languageArr.length-1)];

  // money & currency & deposits
  if (percent < 50) {
    item.currency = currencyArr[0];
    item.money = 0;
    item.deposits = depositArr[1];
  } else {
    item.currency = currencyArr[randomInteger(0, currencyArr.length-1)];
    item.money = randomInteger(0, 30000);
    item.deposits = depositArr[randomInteger(0, depositArr.length-1)];
  }

  // activity
  item.activity = activityArr[randomInteger(0, activityArr.length-1)];

  // isTradeAble
  item.isTradeAble = isTradePossibleArr[randomInteger(0, isTradePossibleArr.length-1)];

  // accountType
  item.accountType = accountTypeArr[randomInteger(0, accountTypeArr.length-1)];

  // lastNote
  item.lastNote = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia quaerat voluptatum nisi sapiente veritatis quam sunt pariatur at, quidem, officiis.';

  // dateRegistration
  item.dateRegistration = randomInteger(1483228800000, 1614556800000);

  // lastActivity
  item.lastActivity = randomInteger(item.dateRegistration, 1614556800000+111);

  // dateLastNote
  item.dateLastNote = randomInteger(item.lastActivity, 1614556800000+111);

  // broker && brokerPosition && brokerTeam
  let brokerID = brokersDB[randomInteger(0, brokersDB.length-1)];
  item.broker = brokerID.name;
  item.brokerPosition = brokerID.brokerPosition;
  item.brokerTeam = brokerID.brokerTeam;

  randomDataBase.push(item);
}

console.log( JSON.stringify(randomDataBase) );
