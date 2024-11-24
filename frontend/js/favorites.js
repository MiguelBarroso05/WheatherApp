window.onload = () => {
    displayFavoritesWeatherData();
};


// Fetches weather data for all favorite cities, sorts them alphabetically, and displays the results
async function displayFavoritesWeatherData() {
    const favoritesList = document.getElementById('weatherResults');

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let backgroundImage = false; // Ensures the background is only set once

    // Array to store the weather data for each city
    const weatherDataArray = [];

    // Fetch weather data for each city
    for (const city of favorites) {
        try {
            const response = await fetch(`http://localhost:3001/api/weather?location=${city}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            
            const data = await response.json();
            weatherDataArray.push({
                name: data.currentWeather.location.name,
                region: data.currentWeather.location.region,
                temperature: data.currentWeather.current.temp_c,
                condition: data.currentWeather.current.condition.text,
                icon: data.currentWeather.current.condition.icon,
            });
        } 
        catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Sort the weather data alphabetically by city name
    weatherDataArray.sort((a, b) => a.name.localeCompare(b.name));

    // Set the background based on the first city in the sorted list
    if (weatherDataArray.length > 0) {
        const firstCityCondition = weatherDataArray[0].condition.toLowerCase();
        setWeatherBackground(firstCityCondition);
    }

    // Generate and display the cards for each city
    weatherDataArray.forEach((city, index) => {
        const bgClass = index % 2 === 1 ? 'bg-light-gray' : 'bg-dark';

        const cityCard = `
            <div class="col-12 col-md-12 mb-4">
                <div class="card ${bgClass} text-white text-center p-4 shadow-lg">
                    <span style="text-align:left">
                        <!-- Star icon for removing from favorites -->
                        <svg id="favoriteIcon-${index}" class="star" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 576 512" fill="rgb(255, 208, 0)" onclick="removeFavorite(${index})">
                            <path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"/>
                        </svg>
                    </span>
                    <h3 class="mb-3">${city.name}, ${city.region}</h3>
                    <div class="d-flex justify-content-center align-items-center mb-4">
                        <div class="temperature-display me-3" style="font-size: 4rem; font-weight: bold;">
                            ${city.temperature}°C
                        </div>
                        <!-- Weather icon -->
                        <img src="https:${city.icon}" alt="${city.condition}" style="width: 100px;">
                    </div>
                    <p class="lead mb-1">${city.condition}</p>
                </div>
            </div>
        `;

        favoritesList.innerHTML += cityCard;
    });
}


// Removes a city from the localstorage
function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites[id]) {
        favorites.splice(id, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        location.reload();
    }
}