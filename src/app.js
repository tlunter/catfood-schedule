import ReactDOM from 'react-dom';
import React from 'react';

const initialStartingDate = new Date(2016, 4, 29);
const scheduleLength = 7 * 4;
const morningFeedingTime = 6 * 60 + 45; // 6:45am
const afternoonFeedingTime = 17 * 60; // 5pm
const morningFeedingTimeOffset = morningFeedingTime - 2 * 60;
const afternoonFeedingTimeOffset = afternoonFeedingTime - 2 * 60;

const chicken = { name: "Chicken Frick 'Azee", color: "#ffde38" },
      turkey = { name: "Fowl Ball", color: "#a57232" },
      pumpkin = { name:"Funk in the Trunk", color: "#098ed0" },
      lamb = { name: "Lamb Burgini", color: "#17ae15" },
      salmon = { name: "Goldie Lox", color: "#efaf39" },
      beef = {name: "The Double Dip", color: "#801241" },
      mystery = { name: "Mystery: Choose at Random", color: "linear-gradient(to right top, #FF9999, #FFCC99, #FFFF99, #99FF99, #99CCFF, #9999FF, #CC99FF)" };

const dayOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const weeklySchedule = [
  [chicken, turkey],
  [chicken, chicken],
  [turkey, chicken],
  [chicken, turkey],
  [chicken, chicken],
  [turkey, chicken],
  [chicken, chicken],
];

const isThursday = function(date) {
  return date.getDay() == 4;
};

const isSaturday = function(date) {
  return date.getDay() == 6;
};

const thursdayMeals = function(dayOfSchedule) {
  const week = parseInt(dayOfSchedule / 7);

  if (week != 1) {
    return [mystery, chicken];
  } else {
    return weeklySchedule[4];
  }
};

const saturdayMeals = function(dayOfSchedule) {
  const week = parseInt(dayOfSchedule / 7);

  if (week != 4) {
    return [chicken, mystery];
  } else {
    return weeklySchedule[6];
  }
};

const millisToDays = function(millis) {
  return millis / (86400 * 1000)
};

const findDayOfSchedule = function(date) {
  return parseInt(millisToDays(date - initialStartingDate) % scheduleLength);
};

const dateToMinutes = function(date) {
  return date.getHours() * 60 + date.getMinutes();
};

var App = React.createClass({
  getInitialState: function() {
    return {
      date: new Date(),
      loading: true,
      fed: false,
      success: 0,
    };
  },
  componentWillMount: function() {
    setInterval(this.updateApp, 2000);
    this.updateApp()
  },
  clickedFed: function() {
    fetch('/fed', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fed: true })
    })
    .then(() => this.setState({ success: 3 }))
    .then(this.updateApp);
  },
  updateApp: function() {
    const nextDate = new Date();

    fetch('/fed')
      .then((response) => response.json())
      .then((json) => {
        this.setState((prevState, props) => {
          return {
            date: nextDate,
            fed: json.fed,
            loading: false,
            success: (prevState.success > 0) ? prevState.success - 1 : 0
          };
        });
      });
  },
  meals: function() {
    const currentDay = findDayOfSchedule(this.state.date);

    if (isThursday(this.state.date)) {
      return thursdayMeals(currentDay);
    } else if (isSaturday(this.state.date)) {
      return saturdayMeals(currentDay);
    } else {
      return weeklySchedule[currentDay % 7];
    }
  },
  renderSuccess: function(mark) {
    const opacity = this.state.success > 0 ? 1 : 0;
    return (
      <div
        className="success"
        style={{opacity: opacity}}>
        Success!
      </div>
    );
  },
  renderMeal: function(meal, mealGroup) {
    const dow = dayOfWeek[this.state.date.getDay()];
    const mealType = (mealGroup === 'morning') ? 'Breakfast' : 'Dinner';
    return (
      <div>
        <div className="mealType">{dow} {mealType}</div>
        <div className="meal">{meal.name} - Free</div>
        <button
          className="button"
          onClick={this.clickedFed}
          disabled={this.state.fed}>
            Fed{this.state.fed ? '!' : '?'}
        </button>
      </div>
    );
  },
  renderLoading: function() {
    return (<div className="loading">Loading!</div>);
  },
  render: function() {
    const meals = this.meals();
    const currentMinutes = dateToMinutes(this.state.date);
    let meal, mealGroup;

    if (currentMinutes <= morningFeedingTimeOffset || currentMinutes < afternoonFeedingTimeOffset) {
      mealGroup = 'morning';
      meal = meals[0];
    } else {
      mealGroup = 'evening';
      meal = meals[1];
    }

    const backgroundColor = (this.state.loading) ? '#ececec' : meal.color;
    const filter = this.state.fed ? 'grayscale(75%)' : '';

    return (
      <div className="app">
        <div className="background"  style={{background: backgroundColor, filter: filter}} />
        {this.renderSuccess()}
        {this.state.loading ? this.renderLoading() : this.renderMeal(meal, mealGroup)}
      </div>
    );
  }
});

ReactDOM.render(<App />, document.querySelector("#content"));
