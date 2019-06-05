var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(element){
      sum += element.value;
      return sum;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },

    totals: {
      exp: 0,
      inc: 0
    },

    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      theArray = data.allItems[type];

      if (theArray.length === 0) {
        ID = 0;
      } else {
        ID = theArray[theArray.length - 1].id + 1;
      }

      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else {
        newItem = new Income(ID, des, val);
      }

      theArray.push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      // console.log(`ids = ${ids}`);

      index = ids.indexOf(id);
      // console.log(`index ${index}`);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }

      // theArray = data.allItems[type];
      // theArray.splice(id);
      // return theArray;
    },

    // calculation: function(type, val) {
    //   data.totals[type] = data.totals[type] + val
    //   return data.totals[type];
    // },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spend
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      var incTotal = data.totals.inc;

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(incTotal);
      });
    },

    getPetcentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        incomes: data.totals.inc,
        expenses: data.totals.exp
      }
    },

    testing: function() {
      return data.allItems;
    }
  };

})();

var uIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    expenseContainer: '.expenses__list',
    incomeContainer: '.income__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    // 1. Plus or minus before the number
    // 2. Exactly 2 decimal points
    // 3. Comma separating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length -3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++){
      callback(list[i], i);
    };
  };

  return {

    getInput: function() {

      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHTML, element;

      if (type === 'exp') {
        element = DOMstrings.expenseContainer;

        html = `<div class="item clearfix" id="exp-%id%">
                  <div class="item__description">%description%</div>
                  <div class="right clearfix">
                      <div class="item__value">%value%</div>
                      <div class="item__percentage">21%</div>
                      <div class="item__delete">
                          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                  </div>
              </div>`;
      } else {
        element = DOMstrings.incomeContainer;

        html = `<div class='item clearfix' id='inc-%id%'>
                    <div class='item__description'>%description%</div>
                    <div class='right clearfix'>
                        <div class='item__value'>%value%</div>
                        <div class='item__delete'>
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
      };

      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields,

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      var fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.incomes, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.expenses, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---"
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        // Do stuff
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---"
        }

      });
    },

    displayMonth: function() {
      var now, year, months, month, dateElement;
      var now = new Date();

      months = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

      year = now.getFullYear();
      month = now.getMonth();
      month = months[month];

      dateElement = document.querySelector(DOMstrings.dateLabel);
      dateElement.textContent = month + ' ' + year;
    },

    changeType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ', ' +
        DOMstrings.inputDescription + ', ' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();

var controller = (function(budgetCtrl, uICtrl) {

  var setUpEventListeners = function() {
    var DOM = uICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    })

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', uICtrl.changeType);
  };

  var updateBudget = function() {
    var budget, display;

    // 1. calculate the budget
    budgetCtrl.calculateBudget();

    // 2. return the budget
    budget = budgetCtrl.getBudget();

    // 3. display the budget on the UI
    uICtrl.displayBudget(budget);

  };

  var updatePercentages = function() {

    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPetcentages();

    // 3. Update the UI
    uICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function () {
    var input, newItem, data;

    // 1. get the input data
    input = uICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. add the item to the UI
      uICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      uICtrl.clearFields();

      // 5. calculate and update the budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();

    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, slitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // 1. Delete the item from the data structure
    var item = budgetCtrl.deleteItem(type, ID);

    // 2. Delete the item from the UI
    uICtrl.deleteListItem(itemID);

    // 3. Update and show the new budget


  };

  return {
    init: function() {
      console.log('App has started');
      uICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        incomes: 0,
        expenses: 0
      });
      setUpEventListeners();
      uICtrl.displayMonth();
    }
  };

})(budgetController, uIController);

controller.init();


