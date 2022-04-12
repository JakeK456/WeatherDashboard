var weatherBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?&exclude=minutely,hourly,alerts&units=imperial&appid=423f62f077e216c8f64b4992f27ead8c"
var geoCodeBaseUrl = "https://api.openweathermap.org/geo/1.0/direct?&appid=423f62f077e216c8f64b4992f27ead8c"

var searchButtonEl = $("#search-button");
var searchInputEl = $("#search-input");
var searchHistoryContainerEl = $("#search-history");

// object to store history. reads and writes local storage
var searchHistory = {
    maxIndexes: 7,
    history: [],

    getHistory(){
        var retval = JSON.parse(localStorage.getItem("history"));
        if (retval === null){
            this.history = [];
        }
        else{
            this.history = retval;
        }
        return this.history;
    },

    addToHistory(city){
        this.getHistory();

        if (this.history.includes(city)) return;

        if (this.history.length > this.maxIndexes) this.history.pop();

        this.history.unshift(city);

        localStorage.setItem("history", JSON.stringify(this.history));
    }
}

// holds all relevant weather data per location
var weatherSummary = {
    city: null,
    lat: null,
    lon: null,
    current: null,
    forecast: []
}

// holds weather data per location and time
function weatherMoment(unixTime, tempF, windSpeedMPH, humidity, uvi, icon){
    this.unixTime = unixTime;
    this.tempF = tempF;
    this.windSpeedMPH = windSpeedMPH;
    this.humidity = humidity;
    this.uvi = uvi;
    this.icon = icon;
}

// grabs history from local storage and renders
renderSearchHistory();

// default city when loading page
geoCodeApi("San Diego");

// handles user input when search button is clicked
searchButtonEl.on('click', function(event){
    if (searchInputEl.val() === "") return;
    geoCodeApi(searchInputEl.val());
});

// handles when user clicks a search history button
searchHistoryContainerEl.on('click', function(event){
    var target = event.target;

    if (target.tagName === "BUTTON"){
        geoCodeApi(target.textContent);
    }
});

// calls geocode api to return lat,lon given city name
function geoCodeApi(city){
    var requestUrl = geoCodeBaseUrl + "&q=" + city;
    fetch(requestUrl)
        .then(function (response) {
            if (response.status !== 200){
                console.log("Check Response Status!");
            }
        return response.json();
        })
        .then(function (data) {
            if (data.length === 0){
                searchInputEl.val("");
                searchInputEl.attr("placeholder", "Enter a valid city.");
                return;
            } 
            weatherSummary.city = data[0].name;
            searchHistory.addToHistory(weatherSummary.city);
            renderSearchHistory();
            getWeatherApi(data[0].lat, data[0].lon);
        });
}

// returns weather object given a lat,lon
function getWeatherApi(lat, lon) {
    var requestUrl = weatherBaseUrl + "&lat=" + lat + "&lon=" + lon
    fetch(requestUrl)
        .then(function (response) {
            if (response.status !== 200){
                console.log("Check Response Status!");
            }
        return response.json();
        })
        .then(function (data) {
            console.log(data);
            var weatherSummary = grabRelevantData(data);
            renderWeather(weatherSummary);
        });
}

// sifts through weatherAPI to only grab needed data
function grabRelevantData(data){

    weatherSummary.lat = data.lat;
    weatherSummary.lon = data.lon;

    var current = data.current;

    weatherSummary.current = new weatherMoment(current.dt, current.temp, current.wind_speed, current.humidity, current.uvi, current.weather[0].icon);
    
    weatherSummary.forecast = [];
    for (var i = 1; i < 6; i++){
        var day = data.daily[i];
        weatherSummary.forecast.push(new weatherMoment(day.dt, day.temp.day, day.wind_speed, day.humidity, day.uvi, day.weather[0].icon));
    }
    
    return weatherSummary;
}

// renders both current and forecasted weather
function renderWeather(weatherSummary){
    renderCurrentWeather(weatherSummary.current);
    renderForecastWeather(weatherSummary.forecast);
}

// creates all current weather elements and renders to top of container
function renderCurrentWeather(currentSummary){
    var containerEl = $("#current-weather");
    var headerEl = $(containerEl.children()[0]);
    var iconEl = $("<i>");
    var tempSpanEl = $($(containerEl.children()[1]).children()[0]);
    var windSpanEl = $($(containerEl.children()[2]).children()[0]);
    var humiditySpanEl = $($(containerEl.children()[3]).children()[0]);
    var uviSpanEl = $($(containerEl.children()[4]).children()[0]);

    headerEl.text(weatherSummary.city + " " +  moment.unix(currentSummary.unixTime).format("M/DD/YYYY"));
    iconEl.css("content", 'url(' + getIconUrl(currentSummary.icon) + ')');
    iconEl.addClass("align-middle");
    tempSpanEl.text(currentSummary.tempF + " " + String.fromCharCode(176) + "F");
    windSpanEl.text(currentSummary.windSpeedMPH + " MPH");
    humiditySpanEl.text(currentSummary.humidity + "%");
    uviSpanEl.text(currentSummary.uvi);
    uviSpanEl.addClass("badge bg-" + getUVIndexColor(currentSummary.uvi));

    headerEl.append(iconEl);
}

// creates and renders five cards to bottom of container
function renderForecastWeather(forecastSummary){
    var forecastEl = $("#forecast-weather");
    var forecastCardContainerEl = $(forecastEl.children()[1]);
    
    forecastCardContainerEl.empty();

    for (var i = 0; i < forecastSummary.length; i++){
        var card = new createForecastCard(forecastSummary[i]);
        forecastCardContainerEl.append(card);
    }
}

// creates cards given forecasted weather data
function createForecastCard(forecastIndex){
    var card = $('<div>').addClass('col card m-3 p-0');
    var cardBody = $('<div>').addClass('card-body custom-bg');

    var cardTitle = $('<h5>').addClass('card-title');
    cardTitle.text(moment.unix(forecastIndex.unixTime).format("M/DD/YYYY"));
    cardBody.append(cardTitle);

    var iconEl = $('<i>');
    iconEl.css("content", 'url(' + getIconUrl(forecastIndex.icon) + ')');
    cardBody.append(iconEl);

    var tempEl = $('<p>').addClass('card-text');
    tempEl.text("Temp: " + forecastIndex.tempF + " " + String.fromCharCode(176) + "F");
    cardBody.append(tempEl);

    var windEl = $('<p>').addClass('card-text');
    windEl.text("Wind: " + forecastIndex.windSpeedMPH + " MPH");
    cardBody.append(windEl);

    var humidityEl = $('<p>').addClass('card-text');
    humidityEl.text("Humidity: " + forecastIndex.humidity + " %");
    cardBody.append(humidityEl);
    
    card.append(cardBody);

    return card;
}

// grabs search history from local storage and creates list of buttons
// when user clicks a button, runs api call for that city
function renderSearchHistory(){
    searchHistory.getHistory();
    searchHistoryContainerEl.empty();

    for (var i = 0; i < searchHistory.history.length; i++){
        var historyButton = $('<button>');
        historyButton.addClass("list-group-item list-group-item-action");
        historyButton.text(searchHistory.history[i]);
        searchHistoryContainerEl.append(historyButton);
    }
}

// concatenates url given icon code
function getIconUrl(iconCode){
    return "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
}

// returns bootstrap background color based on uvi 
function getUVIndexColor(uvi){
    if (uvi <= 2.5) return "success";
    if (uvi <= 5.5) return "warning"; 
    return "danger";
}