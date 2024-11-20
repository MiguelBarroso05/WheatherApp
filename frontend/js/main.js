document.getElementById('weatherForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    const location = document.getElementById('locationInput').value;
    try {
        // Faz a requisição para o backend (com dados para o clima atual e previsão)
        const response = await fetch(`http://localhost:3001/api/weather?location=${location}`);
        //const response2 = await fetch(`http://localhost:3001/api/mostSearchedCity/insert?city=${location}`);
        //console.log(await response2.json());
        const data = await response.json();

        if (data && data.currentWeather && data.forecast) {
            // Exibe as informações do clima atual no primeiro card
           displayWeatherData(data.currentWeather.current, data.currentWeather.location);

            // Exibe a previsão para os próximos 3 dias
           displayForecast(data.forecast.forecast);
            
        } else {
            throw new Error('Dados incompletos recebidos da API');
        }
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error);
        document.getElementById('weatherResults').innerHTML = '<p class="text-danger">Erro ao buscar dados da previsão. Tente novamente mais tarde.</p>';
    }
});

function displayWeatherData(current, location) {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = `
        <!-- Card de Clima Atual -->
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
                <p class="small">Wind: ${current.wind_kph} km/h | Humity: ${current.humidity}%</p>
            </div>
        </div>
    `;
}


function displayForecast(forecast) {
    const weatherContainer = document.getElementById('weatherContainer');
    

    let forecastHTML = ``;

    forecast.forecastday.forEach((day, index) => {
        const bgClass = index % 2 === 1 ? 'bg-light-gray' : 'bg-dark';
        // Ignora o primeiro dia
        if (index > 0) {
            forecastHTML += `
                <div class="card text-center text-white ${bgClass} shadow-sm mb-3 col-md-2">
                    <div class="p-2">
                        <h5 class="mb-1">${new Date(day.date).toLocaleDateString('pt-PT', { weekday: 'short' })}</h5>
                        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" style="width: 40px; margin: 0 auto;">
                        <div class="temperature-display mt-2" style="font-size: 1.5rem; font-weight: bold;">
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

window.onload = async () => {
    const location = await fetch(`http://localhost:3001/api/mostSearchedCity`);
    let locationJson = await location.json();
    locationJson = locationJson[0].city.replace(/_/g, ' ')
    console.log(locationJson);
    try {
        const response = await fetch(`http://localhost:3001/api/weather?location=${locationJson}`);
        const data = await response.json();
        console.log(data); // Processa os dados conforme necessário
        displayMostSearchedCity(data.currentWeather)
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
};


function displayMostSearchedCity(forecast) {
    const weatherContainer = document.getElementById('topSearchesCity');

    let forecastHTML = `
                  <!-- Card de Clima Atual -->
        <div class=" mb-4">
            <div class="card bg-dark text-white text-center p-4 shadow-lg">
                <h3 class="mb-3">${forecast.location.name}, ${forecast.location.region}</h3>
                <div class="d-flex justify-content-center align-items-center mb-4">
                    <div class="temperature-display me-3" style="font-size: 4rem; font-weight: bold;">
                        ${forecast.current.temp_c}°C
                    </div>
                    <img src="https:${forecast.current.condition.icon}" alt="${forecast.current.condition.text}" style="width: 60px;">
                </div>
                <p class="lead mb-1">${forecast.current.condition.text}</p>
                <p class="small">Vento: ${forecast.current.wind_kph} km/h | Humidade: ${forecast.current.humidity}%</p>
            </div>
        </div>
            `;



    weatherContainer.innerHTML += forecastHTML;
}


document.addEventListener('DOMContentLoaded', () => {
    const locationButton = document.getElementById('locationButton');
    const mapOverlay = document.getElementById('mapOverlay');

    locationButton.addEventListener('click', () => {
        // Chama a função para obter a localização do utilizador
        getUserLocation();
    });

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocalização não é suportada pelo seu navegador.");
        }
    }

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Busca os dados de previsão usando as coordenadas
        fetchWeatherDataByCoordinates(latitude, longitude);

        // Oculta a `div` de sobreposição após obter a localização com sucesso
        mapOverlay.style.display = 'none';
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("Usuário negou o pedido para Geolocalização.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Informações de localização estão indisponíveis.");
                break;
            case error.TIMEOUT:
                alert("O pedido para obter localização expirou.");
                break;
            case error.UNKNOWN_ERROR:
                alert("Um erro desconhecido ocorreu.");
                break;
        }
    }

    async function fetchWeatherDataByCoordinates(latitude, longitude) {
        try {
            const response = await fetch(`http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`);
            const data = await response.json();

            // Verifica se os dados são válidos antes de exibir
            if (data.currentWeather && data.forecast) {
                displayWeatherData(data.currentWeather, data.location);
                displayForecast(data.forecast);
            } else {
                alert("Não foi possível obter os dados meteorológicos.");
            }
        } catch (error) {
            console.error('Erro ao buscar previsão do tempo:', error);
            alert("Erro ao buscar previsão do tempo.");
        }
    }
});