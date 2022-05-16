'use strict';

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
