    let weatherCodes = null;
    
    fetch('public/weather-codes.json')
    .then(response => {
    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Parse the JSON content
    })
    .then(data => {
        weatherCodes = data;
        console.log(data); // Log the JSON data to the console

        // Set up the button event listener only after the data is loaded
        $('#searchForecastBtn').on('click', handleForecastSearch);
    })
    .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    });

    

    // When search button is clicked:
    function handleForecastSearch() {

        console.log(weatherCodes)

        // Make sure weatherCodes fetch is loaded before continuing
        if (!weatherCodes) {
            console.error('Weather codes are not loaded yet');
            return;
        }
  

        // Get location from user input
        let queryLocation = $('#searchInput').val().trim();
        let latitude;
        let longitude;

        // get formattedDates
        let d = new Date();
        let formattedDate = d.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        // Make first API call with coordinates to return a location
        $.ajax(`https://us1.locationiq.com/v1/search?key=pk.d8454b1e854370aee9f8ee2ae06bb7f6&q=${queryLocation}&format=json`, {
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                latitude = response[0].lat;
                longitude = response[0].lon;
                let location = response[0].display_name.split(",")[0];
                $('#info').text(location + " " + formattedDate);

                // Fetch the selected option from the dropdown.
                const dropdownSelection = $('#forecast-options').find(":selected").text();
                let option = dropdownSelection;
                $('#weather-type').text(option);



                // Switch that controls the second API request for weather data based on what type has been picked.
                let forecastUrl = ''; // This will hold the URL for the API request
                let forecastParams = ''; // This will hold the parameters (hourly, daily, etc.)

                // Decide which forecast to request based on the selected option
                switch(option) {
                    case "Hourly":
                        console.log("Hourly forecast selected.");
                        forecastUrl = `https://api.open-meteo.com/v1/forecast`;
                        forecastParams = `latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m`;
                        break;
                    case "Daily":
                        console.log("Daily forecast selected.");
                        forecastUrl = `https://api.open-meteo.com/v1/forecast`;
                        forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max&forecast_days=1`;
                        break;
                    case "Weekly":
                        console.log("Weekly forecast selected.");
                        forecastUrl = `https://api.open-meteo.com/v1/forecast`;
                        forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max&forecast_days=10`;
                        break;
                    default:
                        console.error("Invalid option selected");
                        return; // Exit if no valid option is selected
                }

                // Make the API request for weather data based on the selected option
                $.ajax(`${forecastUrl}?${forecastParams}`, {
                    method: 'GET',
                    dataType: 'json',
                    success: (response) => {
                        console.log(response);

                        // Get reference to forecast-container and forecast-wrapper for appending elements.
                        const forecastContainer = $('#forecast-container');
                        const forecastWrapper = $('#forecast-wrapper');

                        // Clear div of previous results and reset button.
                        forecastWrapper.empty(); // Clear previous forecasts
                        $('#nextDayBtn').remove();

                        // Loop through the data depending on the selected option
                        switch(option) {

                            case "Hourly":

                                // Loop through hourly data
                                for (let i = 0; i < 24; i++) {

                                    let forecastDiv = $('<div class="forecast-card" id="forecast-' + i + '"></div>');

                                    // Create time and temperature divs inside forecastDiv
                                    let timeElem = $('<div class="time"></div>').text(response.hourly.time[i]);
                                    let tempElem = $('<div class="temp"></div>').text(response.hourly.temperature_2m[i] + '°');
                                    forecastDiv.append(timeElem).append(tempElem);

                                    
                                    // Handle weather codes and displaying images while setting description (condition) text.
                                    let weatherCode = response.hourly.weather_code[i];
                                    let weatherCodeString = weatherCode.toString().padStart(2, '0');


                                    let conditionElem = $('<div class="condition"></div>');
                                    if (weatherCodes[weatherCodeString]) {
                                        conditionElem.text(weatherCodes[weatherCodeString].description);
                                        let weatherImg = $(`<img id="weatherImg-${i}" />`)
                                            .attr("src", `${weatherCodes[weatherCodeString].image}`)
                                            .css({"width": "64px", "height": "64px"});
                                        forecastDiv.append(weatherImg);  // Append the image to the forecast card
                                    } else {
                                        conditionElem.text("Weather condition not available");
                                    }

                                    //append final elements together and append to forecast-wrapper
                                    forecastDiv.append(conditionElem);  // Append the condition text
                                    forecastWrapper.append(forecastDiv);  // Append the forecast card to the wrapper
                                }
                                break;

                            case "Daily":
                                // Loop through daily data
                                for (let i = 0; i < 1; i++) {

                                    let forecastDiv = $('<div class="forecast-card" id="forecast-' + i + '"></div>');

                                    // Create time and temperature divs inside forecastDiv
                                    let timeElem = $('<div class="time"></div>').text(response.daily.time[i]);
                                    let tempElem = $('<div class="temp"></div>').text(response.daily.temperature_2m_max[i] + '° / ' + response.daily.temperature_2m_min[i] + '°');
                                    forecastDiv.append(timeElem).append(tempElem);

                                    // Handle weather codes and displaying images while setting description (condition) text.
                                    let weatherCode = response.daily.weather_code[i];
                                    let weatherCodeString = weatherCode.toString().padStart(2, '0');

                                    let conditionElem = $('<div class="condition"></div>');
                                    if (weatherCodes[weatherCodeString]) {
                                        conditionElem.text(weatherCodes[weatherCodeString].description);
                                        let weatherImg = $(`<img id="weatherImg-${i}" />`).attr("src", `${weatherCodes[weatherCodeString].image}`).css({"width": "64px", "height": "64px"});

                                        forecastDiv.append(weatherImg);
                                    } else {
                                        conditionElem.text("Weather condition not available");
                                    }

                                    //append final elements together and append to forecast-wrapper
                                    forecastDiv.append(conditionElem);
                                    forecastWrapper.append(forecastDiv);
                                }
                                break;

                            case "Weekly":
                                // Loop through weekly data
                                for (let i = 0; i < 10; i++) {

                                    let forecastDiv = $('<div class="forecast-card" id="forecast-' + i + '"></div>');

                                    // Create time and temperature divs inside forecastDiv
                                    let timeElem = $('<div class="time"></div>').text(response.daily.time[i]);
                                    let tempElem = $('<div class="temp"></div>').text(response.daily.temperature_2m_max[i] + '° / ' + response.daily.temperature_2m_min[i] + '°');
                                    forecastDiv.append(timeElem).append(tempElem);

                                    // Handle weather codes and displaying images while setting description (condition) text.
                                    let weatherCode = response.daily.weather_code[i];
                                    let weatherCodeString = weatherCode.toString().padStart(2, '0');

                                    let conditionElem = $('<div class="condition"></div>');
                                    if (weatherCodes[weatherCodeString]) {
                                        conditionElem.text(weatherCodes[weatherCodeString].description);
                                        let weatherImg = $(`<img id="weatherImg-${i}" />`).attr("src", `${weatherCodes[weatherCodeString].image}`).css({"width": "64px", "height": "64px"});

                                        forecastDiv.append(weatherImg);
                                    } else {
                                        conditionElem.text("Weather condition not available");
                                    }

                                    //append final elements together and append to forecast-wrapper
                                    forecastDiv.append(conditionElem);
                                    forecastWrapper.append(forecastDiv);
                                }
                                break;
                        }

                        // Append 'Next Day' button after all forecasts are loaded and loop has finished.
                        let nextDayBtn = $('<button id="nextDayBtn" class="next-day-btn">Next Day</button>');
                        $('#forecast-container').append(nextDayBtn);
                    }
                });
            }
        });
    };
