var weatherBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?&exclude=minutely,hourly,alerts&units=imperial&appid=423f62f077e216c8f64b4992f27ead8c"
var geoCodeBaseUrl = "http://api.openweathermap.org/geo/1.0/direct?&appid=423f62f077e216c8f64b4992f27ead8c"


var searchButtonEl = $("#search-button");
var searchInputEl = $("#search-input");

searchButtonEl.on('click', function(event){
    geoCodeApi(searchInputEl.val());
});

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
            weatherSummary.city = data[0].name;
            getWeatherApi(data[0].lat, data[0].lon);
        });
}

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
            var weatherSummary = grabRelevantData(data);
            renderWeather(weatherSummary);
        });
}

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

function renderWeather(weatherSummary){
    renderCurrentWeather(weatherSummary.current);
    renderForecastWeather(weatherSummary.forecast);
}

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
    tempSpanEl.text(currentSummary.tempF + " " + String.fromCharCode(176) + "F");
    windSpanEl.text(currentSummary.windSpeedMPH + " MPH");
    humiditySpanEl.text(currentSummary.humidity + "%");
    uviSpanEl.text(currentSummary.uvi);

    headerEl.append(iconEl);
}

function renderForecastWeather(forecastSummary){
    var forecastEl = $("#forecast-weather");
    var forecastCardContainerEl = $(forecastEl.children()[1]);
    
    forecastCardContainerEl.empty();

    console.log(forecastSummary);

    for (var i = 0; i < forecastSummary.length; i++){
        var card = new createForecastCard(forecastSummary[i]);
        forecastCardContainerEl.append(card);
    }
}

function createForecastCard(forecastIndex){
    var card = $('<div>').addClass('col card m-2');
    var cardBody = $('<div>').addClass('card-body');

    var cardTitle = $('<h5>').addClass('card-title');
    cardTitle.text(moment.unix(forecastIndex.unixTime).format("M/DD/YYYY"));
    cardBody.append(cardTitle);

    var iconEl = $('<i>');
    console.log(getIconUrl(forecastIndex.icon));
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

var weatherSummary = {
    city: null,
    lat: null,
    lon: null,
    current: null,
    forecast: []
}

function weatherMoment(unixTime, tempF, windSpeedMPH, humidity, uvi, icon){
    this.unixTime = unixTime;
    this.tempF = tempF;
    this.windSpeedMPH = windSpeedMPH;
    this.humidity = humidity;
    this.uvi = uvi;
    this.icon = icon;
}

function getIconUrl(iconCode){
    return "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";
}