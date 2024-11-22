window.onload = async () => {
    await loadMostSearchedCities();
};
  

async function loadMostSearchedCities() {
    const citiesContainer = document.getElementById("mostSearchedCities");

    try {
        const response = await fetch("http://localhost:3001/api/mostSearchedCity/top-cities");
        const cities = await response.json();

        cities.forEach(async (city) => {
            const cityName = city.city.replace(/_/g, " ");
            const weatherResponse = await fetch(`http://localhost:3001/api/weather?location=${cityName}`);
            const weatherData = await weatherResponse.json();

            const location = weatherData.currentWeather.location;
            const current = weatherData.currentWeather.current;

            const cityCard = `
                <div class="col-12 col-md-6 mb-4">
                    <div class="card bg-dark text-white text-center p-4 shadow-lg">
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
        });
    } 
    catch (error) {
        console.error("Erro ao carregar as cidades mais pesquisadas:", error);
        citiesContainer.innerHTML = '<p class="text-danger">Erro ao carregar as cidades mais pesquisadas.</p>';
    }
}