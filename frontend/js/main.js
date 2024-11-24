// Runs when the page loads
window.onload = () => {
    loadLastSearchedCity(); // Load the last searched city from localStorage
};


// Loads the weather data for the last searched city stored in localStorage
async function loadLastSearchedCity() {
    const location = localStorage.getItem('lastcity');

    try {
        const response = await fetch(`http://localhost:3001/api/weather?location=${location}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        displayLastSearchedCity(data.currentWeather); // Display the data for the last searched city
        setWeatherBackground(data.currentWeather.current.condition.text.toLowerCase()); // Set background based on condition
    } catch (error) {
        console.error('Error fetching the last searched city weather data:', error);
    }
}


/*
    Event listener for the search form submission.
    Fetches and displays weather data based on user input.
*/
document.getElementById('weatherForm').addEventListener('submit', async function (event) {
    event.preventDefault(); 
    const location = document.getElementById('locationInput').value;

    if (!location) {
        console.warn("No location entered.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/weather?location=${location}`);
        
        if (!response.ok)
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);

        const data = await response.json();

        if (data && data.currentWeather && data.forecast) {
            localStorage.setItem('lastcity', location); // Save the location in localStorage
            displayWeatherData(data.currentWeather.current, data.currentWeather.location); 
            displayForecast(data.forecast.forecast); 
            addFavorite(data.currentWeather.location.name); // Add to favorites
        } 
        else 
            throw new Error('Dados incompletos recebidos da API');
    } 
    catch (error) {
        // Display error message to the user
          
        if (error.message.startsWith('Error HTTP:')) {
            errorMessage = `Error on API: ${error.message}`;
        }

        document.getElementById('weatherResults').innerHTML = `<div class="col-12 col-md-12 mb-4">
                                                                    <div class="card bg-dark text-white text-center p-4 shadow-lg">
                                                                        <p class="text-danger" style="font-size: 1.7rem">${errorMessage}</p>
                                                                    </div>
                                                                </div>`;    
        }
});


/*
    Event listener for geolocation button click.
    Fetches and displays weather data based on the user's location.
*/
document.getElementById('locationButton').addEventListener('click', async function () {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(`http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const geoLocation = data.currentWeather.location.name;

                    localStorage.setItem('lastcity', geoLocation)
                    if (data && data.currentWeather && data.forecast) {
                        displayWeatherData(data.currentWeather.current, data.currentWeather.location);
                        displayForecast(data.forecast.forecast);
                        addFavorite(data.currentWeather.location.name)
                    } 
                    else
                        throw new Error('Incomplete data received from API.');
                } 
                catch (error) {
                    document.getElementById('weatherResults').innerHTML = `
                        <p class="text-danger">Error fetching location-based weather data. Please try again later.</p>`;
                }
            },
            (error) => {
                // Handle geolocation errors
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.error("Location access denied.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.error("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        console.error("The request to get user location timed out.");
                        break;
                    default:
                        console.error("An unknown error occurred while fetching location.");
                }
            }
        );
    } 
    else {
        alert("Geolocation is not supported by your browser.");
    }
});


// Displays the weather based on the search input from weather_api
function displayWeatherData(current, location) {
    const weatherContainer = document.getElementById('weatherContainer');
    const conditionText = current.condition.text.toLowerCase();

    let starColor = "rgb(255, 255, 255)";
    let storedArray = localStorage.getItem('favorites'); 

    if (storedArray) {
        storedArray = JSON.parse(storedArray); 
        if (storedArray.includes(location.name)) {
            starColor = "rgb(255, 208, 0)";
        }
    }

    weatherContainer.innerHTML = `
        <!-- Card de Clima Atual -->
        <div class="col-12 col-md-6 mb-4">
            <div class="card bg-dark text-white text-center p-4 shadow-lg">
                <span style="text-align:left">
                    <svg id="favoriteIcon" class="star" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 576 512" fill= "${starColor}">
                        <path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"/>
                    </svg>
                </span>
                <h3 class="mb-3">${location.name}, ${location.region}</h3>
                <div class="d-flex justify-content-center align-items-center mb-4">
                    <div class="temperature-display me-3 font-weight-bold" style="font-size: 4rem;">
                        ${current.temp_c}°C
                    </div>
                    <img src="https:${current.condition.icon}" alt="${current.condition.text}" style="width: 100px;">
                </div>
                <p class="lead mb-1">${current.condition.text}</p>
                <p class="small">Wind: ${current.wind_kph} km/h | Humity: ${current.humidity}%</p>
            </div>
        </div>
    `;

    setWeatherBackground(conditionText);
}


// Displays the weather based on the forcats from weather_api
function displayForecast(forecast) {
    const weatherContainer = document.getElementById('weatherContainer');

    let forecastHTML = ``;

    forecast.forecastday.forEach((day, index) => {
        const bgClass = index % 2 === 1 ? 'bg-light-gray' : 'bg-dark';

        if (index > 0) {
            forecastHTML += `
                <div class="card text-center text-white ${bgClass} shadow-sm mb-3 col-12 col-md-2">
                    <div class="p-2">
                        <h5 class="mb-1">${new Date(day.date).toLocaleDateString('pt-PT', { weekday: 'short' })}</h5>
                        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" style="width: 40px; margin: 0 auto;">
                        <div class="temperature-display mt-2 font-weight-bold" style="font-size: 1.5rem;">
                            ${day.day.maxtemp_c}°C
                        </div>
                        <div class="small">${day.day.mintemp_c}°C</div>
                        <p class="small mt-1">${day.day.condition.text}</p>
                    </div>
                </div>
            `;
        }
    });

    weatherContainer.innerHTML += forecastHTML;
}


// Displays the weather for the last city searched after refresh based on the forcast from weather_api
function displayLastSearchedCity(forecast) {
    const weatherContainer = document.getElementById('lastSearchedCity');

    let forecastHTML = `
        <!-- Card de Clima Atual -->
        <div class=" mb-4">
            <div class="card bg-dark text-white text-center p-4 shadow-lg">
            <div class="d-inline-flex align-items-center justify-content-around"> 
                <h1 class="mb-4 font-weight-bold text-secondary">WELCOME BACK!</h1>
                <h2 class="mb-4 font-weight-bold text-secondary">Here's your last last searched city</h2>
            </div>
                <h3 class="mb-3">${forecast.location.name}, ${forecast.location.region}</h3>
                <div class="d-flex justify-content-center align-items-center mb-4">
                    <div class="temperature-display me-3 font-weight-bold" style="font-size: 4rem;">
                        ${forecast.current.temp_c}°C
                    </div>
                    <img src="https:${forecast.current.condition.icon}" alt="${forecast.current.condition.text}" style="width: 60px;">
                </div>
                <p class="lead mb-1">${forecast.current.condition.text}</p>
                <p class="small">Wind: ${forecast.current.wind_kph} km/h | Humidity: ${forecast.current.humidity}%</p>
            </div>
        </div>
            `;

    weatherContainer.innerHTML += forecastHTML;
}


// Adds or removes a city from the favorites list in localStorage
function addFavorite(city) {
    const favoriteIcon = document.getElementById('favoriteIcon');

    if (!favoriteIcon) {
        console.warn('Elemento com o ID "favoriteIcon" não encontrado no DOM.');
        return;
    }

    favoriteIcon.addEventListener('click', (event) => {
        event.preventDefault();

        try {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            if (favorites.includes(city))
                favorites = favorites.filter(item => item !== city);
            else
                favorites.push(city);

            favorites.sort((a, b) => a.localeCompare(b)); // Sort the favorites list alphabetically
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Save the updated list to localStorage
            updateFavoriteIconColor(favorites.includes(city));
        } 
        catch (error) {
            console.error('Error processing favorites in localStorage:', error);
        }
    });
}



// Updates the favorite icon color dynamically
function updateFavoriteIconColor(isFavorite) {
    const favoriteIcon = document.getElementById('favoriteIcon');
    if (favoriteIcon) {
        favoriteIcon.setAttribute('fill', isFavorite ? 'rgb(255, 208, 0)' : 'rgb(255, 255, 255)');
    }
}


// Dynamically sets the background of the application based on weather conditions.
function setWeatherBackground(conditionText) {
    const body = document.body;
    body.className = 'd-flex flex-column';

    if (conditionText.includes('sunny') || conditionText.includes('clear')) {
        body.classList.add('bg-sunny');
    } else if (conditionText.includes('cloudy') || conditionText.includes('overcast')) {
        body.classList.add('bg-cloudy');
    } else if (conditionText.includes('rain') || conditionText.includes('shower') || conditionText.includes('drizzle')) {
        body.classList.add('bg-rainy');
    } else if (conditionText.includes('thunder')) {
        body.classList.add('bg-thunderstorm');
    } else if (conditionText.includes('snow')) {
        body.classList.add('bg-snowy');
    } else if (conditionText.includes('fog') || conditionText.includes('mist') || conditionText.includes('haze')) {
        body.classList.add('bg-foggy');
    } 
}