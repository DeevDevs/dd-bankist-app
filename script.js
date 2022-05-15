'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-05-30T17:01:17.194Z',
    '2021-06-01T23:36:17.929Z',
    '2021-06-03T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//Function to format Sums according to the Currency
const formatCurrency = function (num, acc) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(num);
}; // JONAS, however, suggested to make it more universal with such arguments as - value, locale and currency... I decided to leave it as it is, through the account

//Function for the movements, which is used in the displayMovements function
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 24 * 60 * 60));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  //else
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, options).format(date);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; // We can use innerHTML to address all the content (even HTML tags). Later, we can use it to show the content of the HTML in console.

  //Below we use the SLICE method to create the copy of the original movements array. Hence, we will not mutate the original array with sort, just mutate the copy.
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements; // By default, sort is set to false. Hence, the default movements array is use unless we press the SORT button

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //Here we extract Date of the Movement
    const movDate = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(movDate, acc.locale);

    const html = `        
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formatCurrency(mov, acc)}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Here we count the total balance of the user
const countDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((balance, value) => balance + value, 0);
  labelBalance.textContent = `${formatCurrency(acc.balance, acc)}`;
};

//Here we count total income, total expenses, and interest
const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((accum, mov) => accum + mov, 0);
  const expenses = account.movements
    .filter(mov => mov < 0)
    .reduce((accum, mov) => accum + mov, 0);
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(
      interest => interest >= 1 // I decided to add a filter here, that excludes all the interest below 1EUR. Minimum 1EUR is required.
    )
    .reduce((accum, interest) => accum + interest, 0);
  labelSumIn.textContent = `${formatCurrency(incomes, account)}`;
  labelSumOut.textContent = `${formatCurrency(Math.abs(expenses), account)}`;
  labelSumInterest.textContent = `${formatCurrency(interest, account)}`;
};

// Here we have created usernames for each account
const createUsernames = function (accs) {
  accs.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = acc => {
  //Display movements
  displayMovements(acc);
  //Display balance
  countDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};

// Here we have the timer settings
const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //print the remaining time
    labelTimer.textContent = `${min}:${sec}`;
    //logout, when the time is up
    if (time === -1) {
      clearInterval(timer);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  }; // We put this function here to first run it once before the interval begins. See below...
  //set timer to 5 minutes
  let time = 300;
  //call the timer every second
  tick(); // Here we call it before the interval just to display the timer at its initial stage
  const timer = setInterval(tick, 1000);
  return timer; // We do it to be able to reach it outside the function (this is to fix the problem of two timers running simultaneously)
};

//Here we run the app and display interface
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  //This line BELOW is how we prevent the default feature of the form button to reload the page (submit) whenever the button is pressed
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // The question that is put after the 'currentAccount' is optional chaining
    // Now I Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = '100';

    // Here we create current Date and Time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    labelDate.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Here we clear input fields first
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    //OR
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur(); // This is how we make the field lose focus
    inputLoginPin.blur(); // If cursor was there, it is gone now

    //Here we check if previous timer was running, clear it, and then initialize the new timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    //Here we run all the UI functions to display their results
    updateUI(currentAccount);
  }
});

//Money transfer/loan/closeAcc Functions
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Doing the transfer
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);

    //Adding a Transfer Date
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());
    //OR
    // const isd = new Date().toISOString();
    // receiverAcc.movementsDates.push(isd);
    // currentAccount.movementsDates.push(isd);

    updateUI(currentAccount);

    //Reset Timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loan = Math.floor(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= loan / 10)) {
    // giving a loan with some delay
    setTimeout(function () {
      currentAccount.movements.push(loan);
      //adding a loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      //OR
      // const isd = new Date().toISOString();
      // currentAccount.movementsDates.push(isd);
      updateUI(currentAccount);

      //Reset Timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    //Delete User
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    ); // It has the same function as indexOf, just much more flexible and complex.
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = '0';
  }
  // Empty fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});

//This button makes the movements sorted or not. The SORTING is inside the DisplayMovements function and is activated when sorted is TRUE... However, with the same button we can constantly switch the value of 'sorted' and deactivate that function
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// TRUTH ABOUT MATHS IN JS
// console.log(23 === 23.0); // true
// console.log(0.1 + 0.2); // 0.300000000000004
// console.log(0.1 + 0.2 === 0.3); // false

// //conversion
// console.log(Number('23')); // 23
// console.log(+'23'); // 23 - number, because of type coercion

// //Parsing
// console.log(Number.parseInt('30px', 10)); // 23 - This method retrieves a number from the string. However, the string should start from a number. Second argument is the counting system.
// console.log(Number.parseInt('e43', 10)); // NaN

// console.log(Number.parseInt('  2.4rem ')); // 2
// console.log(Number.parseFloat(' 2.4rem  ')); // 2.4 - it retrieves the decimals too

// // Checking if smth is NaN
// console.log(Number.isNaN(23)); // false
// console.log(Number.isNaN('23')); // false
// console.log(Number.isNaN(+'23')); // false
// console.log(Number.isNaN(+'32X')); // true
// console.log(Number.isNaN(23 / 0)); // false - but it is wrong, because it is INFINITY

// //This is a better way to check if value is a Number or Not
// console.log(Number.isFinite(20)); // true
// console.log(Number.isFinite('20')); // false - because it is NOT a Number
// console.log(Number.isFinite(+'23X')); // false
// console.log(Number.isFinite(23 / 0)); // false

// // Checking if the value is an integer
// console.log(Number.isInteger(20)); // true
// console.log(Number.isInteger(20.0)); // true
// console.log(Number.isInteger(2.3)); // false
// console.log(Number.isInteger(23 / 0)); // false

// MATH AND ROUNDING

// console.log(Math.sqrt(25)); // 5 - Square Root
// console.log(25 ** (1 / 2)); // 5
// console.log(8 ** (1 / 3)); // 2 - this is the only way to calculate a cubic or any following root

// console.log(Math.max(12, '13', 26, '44', 8)); // 44 - returns the MAXIMUM value. it does type coercion
// console.log(Math.max(12, '13', 26, '44px', 8)); // NaN - no parsing though
// console.log(Math.min(12, '13', 26, '44', '8')); // 8 - returns the MINIMUM number

// console.log(Math.PI); // 3.141592653589793
// console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793 - finding out the radius

// console.log(Math.random()); // different values between 0 and 1
// console.log(Math.trunc(Math.random() * 6)); // random between 0 and 5. BUT NO SIX... so
// console.log(Math.trunc(Math.random() * 6) + 1); // random between 1 and 6

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + (min - 1);
// console.log(randomInt(10, 20)); // It is between 10 and 20

// //Rounding integers
// console.log(Math.trunc(23.3)); // 23 --- removing decimals

// console.log(Math.round(23.3)); // 23 --- rounding to the closest
// console.log(Math.round(23.9)); // 24

// console.log(Math.ceil(23.3)); // 24 --- rounding up
// console.log(Math.ceil(23.9)); // 24

// console.log(Math.floor(23.3)); // 23 --- rounding down
// console.log(Math.floor('23.9')); // 23 --- it also does type coercion

// console.log(Math.trunc(-23.4)); // -23
// console.log(Math.floor(-23.4)); // -24

// // Rounding decimals
// console.log((2, 7).toFixed(0)); // 3 --- It rounds to a certain number of decimals... here 0
// console.log((2.7).toFixed(3)); // 2.700 --- but it returns a STRING
// console.log(+(2.345).toFixed(2)); // 2.35 --- so, add  to make it a number

// REMAINDER OPERATOR

// console.log(5 % 2); // 1 - this is remainder
// console.log(8 % 3); // 2  --- 8 = 3 * 2 + 2
// console.log(6 % 2); // 0 --- even
// console.log(7 % 2); // 1 --- odd

// const isEven = n => n % 2 === 0; // check if the number is even
// console.log(isEven(3)); // false
// console.log(isEven(91)); // false
// console.log(isEven(346)); // true

// //Here we color every second movement
// labelBalance.addEventListener('click', function (e) {
//   e.preventDefault();
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//   });
// });

// BIGINT - used to store numbers larger than the biggest of JS

// console.log(2 ** 53 - 1); // 9007199254740991 - the biggest possible number
// console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
// console.log(5483253786631268753199851295n); //5483253786631268753199851295n - n transformed it into a big number
// //OR
// console.log(BigInt(5483253786631268753199851295)); // 5483253786631268468114063360n - It changed the number, but it still big
// console.log(29386346981375816387459n + 31458174325619874356n); //29417805155701436261815n
// console.log(9345619251345143726n * 100000n); //934561925134514372600000n
// // console.log(Math.sqrt(16n)); // error

// // You cannot mix big numbers with regular numbers
// // console.log(34597263598134756138n + 24); // ERROR
// // So, you have to convert reg number using BigInt
// const huge = 245735684579853682n;
// const reg = 23;
// console.log(huge * BigInt(reg)); // 5651920745336634686n

// //Exceptions
// console.log(20n > 15); // true
// console.log(20n > 25); // false
// console.log(20n === 20); // false... because
// console.log(typeof 20n); // bigint
// console.log(20n == 20); // true... because loose comparison
// console.log(huge + ' is Really Big'); // '245735684579853682 is Really Big' ... bigint can be converted into a string

// //Division
// console.log(10n / 3n); // 3n - it cuts the decimal part to be an integer
// console.log(10 / 3); // 3.333333333333335;

// DATES AND TIME

// const now = new Date();
// console.log(now);
// console.log(new Date('May 30 2021 21:19:27')); // Sun May 30 2021 21:19:27 GMT+0400 (Gulf Standard Time)
// console.log(new Date('December 25, 2015')); // Fri Dec 25 2015 00:00:00 GMT+0400 (Gulf Standard Time)
// console.log(new Date(account1.movementsDates[0])); // Tue Nov 19 2019 01:31:17 GMT+0400 (Gulf Standard Time) - RETRIEVED FROM OBJECT

// // The integers represent --- Year, Month(ZERO BASED), Date, Hour, Minute, Second
// console.log(new Date(1992, 7, 5, 22, 3, 22)); //Mon Oct 05 1992 22:03:22 GMT+0400 (Gulf Standard Time)

// // If there is an error (cannot be August 33), it converts into September 2
// console.log(new Date(2045, 7, 33)); // Sat Sep 02 2045 00:00:00 GMT+0400 (Gulf Standard Time)

// // Here is the beginning of UNIX time
// console.log(new Date(0)); // Thu Jan 01 1970 04:00:00 GMT+0400 (Gulf Standard Time)

// // To count three days afte the UNIX time, we can multiply 3(days)*24(hours)*60(minutes)*60(seconds)*1000(miliseconds)
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 04:00:00 GMT+0400 (Gulf Standard Time)

// Working with Dates

// const future = new Date(2034, 7, 5, 15, 23);
// console.log(future);
// console.log(future.getFullYear()); // 2034
// console.log(future.getMonth()); // 7 ... (August - because ZERO BASED)
// console.log(future.getDate()); // 5 ... here you get the DAY of the MONTH
// console.log(future.getDay()); // 6 ... here you get the Day of the WEEK
// console.log(future.getHours()); // 15
// console.log(future.getMinutes()); // 23
// console.log(future.getSeconds()); // 0
// console.log(future.toISOString()); // 2034-08-05T11:23:00.000Z ... international standard string
// console.log(future.getTime()); // 2038389780000 ... this is the miliseconds passed since the beginning of UNIX time - January 1, 1970

// //We can convert it back into the date
// console.log(new Date(2038389780000)); // Sat Aug 05 2034 15:23:00 GMT+0400 (Gulf Standard Time)
// console.log(new Date(1596388836977)); // Time when Jonas was recording this video

// console.log(Date.now()); // 1622396611051

// //To set the date, use the method below. It is applicable for Month, Day, etc.
// future.setFullYear(2040);
// console.log(future); // Sun Aug 05 2040 15:23:00 GMT+0400 (Gulf Standard Time)

// OPERATIONS WITH DATES
// const future = new Date(2034, 7, 5, 15, 23);
// console.log(Number(future));

// //Function that counts the number of days passed between dates
// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// //when I start math between dates, JS converts it to timeStems automatically
// const days1 = calcDaysPassed(new Date(2034, 4, 10), new Date(2034, 5, 23));
// console.log(days1); // 10

// INTERNATIONALIZING DATES

//-------------------------FAKE LOGGED IN-------------------
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = '100';

// // Experimenting API
// const now = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long' /*It can also be 'numeric', and '2-digit'*/,
//   year: 'numeric',
//   weekday: 'long' /*It can also be 'short', and 'narrow'*/,
//   //Each of the elements above is optional... remove it, and it will just disappear from the final representation of date and time.
// };

// const locale = navigator.language;
// console.log(locale); // en-GB - Identifying language by checking the location. It can be inserted into the method below

// labelDate.textContent = Intl.DateTimeFormat(locale, options).format(now); // 04/06/2021 -- DateTimeFormat has the argument of LOCALE, which are unique for each country/region. -- for Syria it would be "٤‏/٦‏/٢٠٢١". Google for "iso languages code table" for more info.
// //Also, you can insert another argument to the DateTimeFormat method, which will help represent time and specify the format. This is an object argument and is OPTIONAL. if it is not used, then only date in default format is shown.

// INTERNATIONALIZING NUMBERS

// const num = 4728374.334;
// console.log('US:      ', new Intl.NumberFormat('en-US').format(num));
// console.log('Germany: ', new Intl.NumberFormat('de-DE').format(num));
// console.log('Syria:   ', new Intl.NumberFormat('ar-SY').format(num));

// const options = {
//   style: 'currency', // 'unit', 'currency' and 'percent', etc.
//   unit: 'mile-per-hour', // this is in case we use unit
//   currency: 'EUR', // this is in case we use currency. it MUST be defined. There is no default.
//   useGrouping: false, // 4728374.334 ... if TRUE - 4,728,374.33
// };
// console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num)); //
// console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num)); //
// console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num)); // changes depending on the options content

// SETTIMEOUT and SETINTERVAL

// setTimeout(() => console.log('Here is your pizza!'), 3000); // It runs after 3 seconds. First argument is the function that initiates the timer
// console.log('Waiting...'); // This line will appear in console immediately, while the line above - after 3 seconds.

// //However, setTimeout is not that simple. We can pass an argument(s) after the assigned time, and the method will use them
// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   4000,
//   'garlic',
//   'salami'
// );

// //The timer can be cleared before initialization
// const ingredients = ['salami', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Have a pizza with ${ing1} and ${ing2}`),
//   5000,
//   ...ingredients
// ); // As there is spinach, the condition below clears the Timer
// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// //setInterval - it is used to repeat some action with certain regularity
// setInterval(function () {
//   const now = new Date();
//   console.log(
//     `${`${now.getHours()}`.padStart(2, 0)}:${`${now.getMinutes()}`.padStart(
//       2,
//       0
//     )}:${`${now.getSeconds()}`.padStart(2, 0)}`
//   );
// }, 1000); // I make it run every second

// NUMERIC SEPARATORS

//we can use underscores to separate thousands, and JS will ignore them
const diameter1 = 267890000000;
const diameter2 = 267_890_000_000;
console.log(diameter1, diameter2); // 267890000000, 267890000000

const price = 15_00;
const price2 = 1_500;

const price3 = 15_00 + 34_0; // we can even sum them up
console.log(price3); // 1840

console.log(Number('23000')); // 23000
console.log(Number('23_000')); // NaN
console.log(parseInt('23_000')); // 23 only
