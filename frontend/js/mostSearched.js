// Runs when the page loads
window.onload = async () => {
    await loadMostSearchedCities();
};
  

// Fetches and displays the most searched cities along with their weather data
async function loadMostSearchedCities() {
    const citiesContainer = document.getElementById("mostSearchedCities");

    try {
        const response = await fetch("http://localhost:3001/api/mostSearchedCity/top-cities");

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const cities = await response.json();

        // Iterate over each city and fetch its weather data
        for (const city of cities) {
            const cityName = city.city.replace(/_/g, " "); // Replace underscores with spaces

            try {
                const weatherResponse = await fetch(`http://localhost:3001/api/weather?location=${cityName}`);
                
                if (!weatherResponse.ok) {
                    throw new Error(`Weather API Error: ${weatherResponse.status} - ${weatherResponse.statusText}`);
                }

                const weatherData = await weatherResponse.json();
                const location = weatherData.currentWeather.location;
                const current = weatherData.currentWeather.current;

                // Create a card for the city and its weather data
                const cityCard = `
                    <div class="col-12 col-md-6 mb-4">
                        <div class="card bg-light-gray text-white text-center p-4 shadow-lg">
                            <h3 class="mb-3">${location.name}, ${location.region}</h3>
                            <div class="d-flex justify-content-center align-items-center mb-4">
                                <div class="temperature-display me-3" style="font-size: 4rem; font-weight: bold;">
                                    ${current.temp_c}°C
                                </div>
                                <img src="https:${current.condition.icon}" alt="${current.condition.text}" style="width: 100px;">
                            </div>
                            <p class="lead mb-1">${current.condition.text}</p>
                            <p class="small">Wind: ${current.wind_kph} km/h | Humidity: ${current.humidity}%</p>
                            <p class="small">Search Count: ${city.search_count}</p>
                        </div>
                    </div>
                `;

                citiesContainer.innerHTML += cityCard;
            } 
            catch (weatherError) {
                console.error(`Error fetching weather data for ${cityName}:`, weatherError);
            }
        }
    } 
    catch (error) {
        console.error("Error loading most searched cities:", error);

        // Display an error message to the user
        citiesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    Error loading the most searched cities. Please try again later.
                </div>
            </div>`;
    }
}