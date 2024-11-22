window.onload = () => {
    displayFavoritesWeatherData();
};

async function displayFavoritesWeatherData() {
    const favoritesList = document.getElementById('weatherResults');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let backgroundImage = false;

    favorites.forEach(async (city, id) => {
        try {
            const response = await fetch(`http://localhost:3001/api/weather?location=${city}`);
            const data = await response.json();
            const location = data.currentWeather.location;
            const current = data.currentWeather.current;
            const cardHTML = `
                <div class="col-12 col-md-12 mb-4">
                    <div class="card bg-dark text-white text-center p-4 shadow-lg">
                        <span style="text-align:left">
                            <svg id="favoriteIcon-${id}" class="star" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 576 512" fill="rgb(255, 208, 0)" onclick="removeFavorite(${id})">
                                <path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"/>
                            </svg>
                        </span>
                        <h3 class="mb-3">${location.name}, ${location.region}</h3>
                        <div class="d-flex justify-content-center align-items-center mb-4">
                            <div class="temperature-display me-3" style="font-size: 4rem; font-weight: bold;">
                                ${current.temp_c}°C
                            </div>
                            <img src="https:${current.condition.icon}" alt="${current.condition.text}" style="width: 100px;">
                        </div>
                        <p class="lead mb-1">${current.condition.text}</p>
                        <p class="small">Wind: ${current.wind_kph} km/h | Humidity: ${current.humidity}%</p>
                        <h1> ${id}</h1>
                    </div>
                </div>
            `;

            if (!backgroundImage)
                backgroundImage = true;
                setWeatherBackground(data.currentWeather.current.condition.text.toLowerCase());

            favoritesList.innerHTML += cardHTML;
        } catch (error) {
            console.error('Erro ao buscar previsão do tempo:', error);
            document.getElementById('weatherResults').innerHTML = '<p class="text-danger">Erro ao buscar dados da previsão. Tente novamente mais tarde.</p>';
        }
    });
}

function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites[id]) {
        favorites.splice(id, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        location.reload();
    }
}