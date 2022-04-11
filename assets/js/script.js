var baseUrl = "https://api.openweathermap.org/data/2.5/onecall?&exclude=minutely,hourly,alerts&units=imperial&appid=423f62f077e216c8f64b4992f27ead8c"

getWeatherApi(33.11583659524207, -117.32090558575199);

function getWeatherApi(lat, lon) {
    var requestUrl = baseUrl + "&lat=" + lat + "&lon=" + lon
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

    headerEl.text("San Diego (4/10/2022) ");
    iconEl.text(currentSummary.icon);
    tempSpanEl.text(currentSummary.tempF + " " + String.fromCharCode(176) + "F");
    windSpanEl.text(currentSummary.windSpeedMPH + " MPH");
    humiditySpanEl.text(currentSummary.humidity + "%");
    uviSpanEl.text(currentSummary.uvi);

    headerEl.append(iconEl);
}

function renderForecastWeather(forecastSummary){
    var forecastEl = $("#forecast-weather");
    var forecastCardContainerEl = $(forecastEl.children()[1]);

    for (var i = 0; i < forecastSummary.length; i++){
        card = createForecastCard(forecastSummary[i]);
        forecastCardContainerEl.append(card);
    }
}


var weatherSummary = {
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

function createForecastCard(forecastIndex){
    var card = $('<div>').addClass('col card m-2');
    var cardBody = $('<div>').addClass('card-body');

    var cardTitle = $('<h5>').addClass('card-title');
    cardTitle.text(moment.unix(forecastIndex.unixTime).format("M/DD/YYYY"));
    cardBody.append(cardTitle);

    var iconEl = $('<i>');
    iconEl.text(forecastIndex.icon)
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

var searchButtonEl = $("#search-button");
var searchInputEl = $("#search-input");

searchButtonEl.on('click', function(event){
    console.log(searchInputEl.val());
});