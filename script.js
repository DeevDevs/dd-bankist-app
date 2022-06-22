'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
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
  locale: 'pt-PT',
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

/**
 * formats sums according to the Currency (форматирует суммы в соответствии с валютой)
 * @param {number, object}
 * @returns {string}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const formatCurrency = function (num, acc) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(num);
};

/**
 * formats sums according to the Currency (форматирует суммы в соответствии с валютой)
 * @param {string, string}
 * @returns {string}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const formatMovementDate = function (date, locale) {
  console.log(locale);
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
};

/**
 * displays account activity in a required way - sorted or not (отображает историю аккаунта в запрошенном формате - сортированные или нет)
 * @param {object, boolean}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  // check if we have to sort the account history (проверяет, нужно ли сортировать историю аккаунта)
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  // create and display the activities (создает и отображает историю аккаунта)
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
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

/**
 * counts the user balance (считает общую сумму на балансе пользователя)
 * @param {object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const countDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((balance, value) => balance + value, 0);
  labelBalance.textContent = `${formatCurrency(acc.balance, acc)}`;
};

/**
 * count total income, total expenses, and interest (подсчитывает общий доход, расходы, и интерес)
 * @param {object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
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
      interest => interest >= 1 // Minimum 1EUR is required.
    )
    .reduce((accum, interest) => accum + interest, 0);
  labelSumIn.textContent = `${formatCurrency(incomes, account)}`;
  labelSumOut.textContent = `${formatCurrency(Math.abs(expenses), account)}`;
  labelSumInterest.textContent = `${formatCurrency(interest, account)}`;
};

/**
 * usernames are created (создаются имена пользователей)
 * @param {array}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
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

/**
 * supporting function that updates the displayed information (вспомогательная функция, которая обновляет отображаемые данные)
 * @param {object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const updateUI = acc => {
  displayMovements(acc);
  countDisplayBalance(acc);
  calcDisplaySummary(acc);
};

/**
 * creates a timer that gets updates after every completed action made by the user (создает таймер и обновляет его после каждого законченного действия пользователя)
 * @param {}
 * @returns {function}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
const startLogoutTimer = function () {
  // creates a timer function for animated countdown (создает анимированный обратный отсчет)
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // print the remaining time (отображает оставшееся время)
    labelTimer.textContent = `${min}:${sec}`;
    // logout, when the time is up (выходит из меню пользователя по окончании 5 минут)
    if (time === -1) {
      clearInterval(timer);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  let time = 300;
  tick();
  // runs the timer function every second (каждую секунду активирует функцию таймера)
  const timer = setInterval(tick, 1000);
  return timer;
};

/**
 * runs the application and displays interface (запускает приложение и отображает интерфейс)
 * @param {event object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  // check if such user exists (проверяет, есть ли такой пользователь)
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    // display welcome message (отображает приветствие)
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = '100';
    // display current Date and Time (отображает время на данный момент)
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
    // clear input fields (опустошает поля ввода данных)
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    // run the timer (запускает таймер)
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    // run UI functions (запускает UI)
    updateUI(currentAccount);
  }
});

/**
 * transfers money to another account (переводит деньги на счет другого аккаунта)
 * @param {event object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
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
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

/**
 * takes a loan from the bank (одалживает деньги у банка)
 * @param {event object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loan = Math.floor(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= loan / 10)) {
    // giving a loan with some delay (для реалистичности, добавляет задержку перед выдачей денег)
    setTimeout(function () {
      currentAccount.movements.push(loan);
      // adding a loan date (добавляет дату перевода)
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

/**
 * closes the bank account (закрывает данный аккаут)
 * @param {event object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // delete user (удаляет аккаунт пользователя)
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    //Hide UI (скрывает интерфейс)
    containerApp.style.opacity = '0';
  }
  // Empty fields (опустошает поля ввода)
  inputCloseUsername.value = inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});

/**
 * sorts the account history (запускает сортировку истории аккаунта)
 * @param {event object}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov (original idea by Jonas Shmedtmann)
 */
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
