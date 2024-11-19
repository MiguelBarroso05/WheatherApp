document.getElementById('weatherForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    const location = document.getElementById('locationInput').value;
    
    try {
        // Faz a requisição para o backend
        const response = await fetch(`http://localhost:3001/api/weather?location=${location}`);
        const data = await response.json();

        // Exibe os dados no frontend
        displayWeatherData(data);
        displayForecast(data);
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error);
        document.getElementById('weatherResults').innerHTML = '<p class="text-danger">Erro ao buscar dados da previsão. Tente novamente mais tarde.</p>';
    }
});

function displayWeatherData(data) {
    const resultsDiv = document.getElementById('weatherResults');
    resultsDiv.innerHTML = `
        <div class="card p-3 mb-3">
            <h3>Previsão para ${data.location.name}</h3>
            <p><strong>Temperatura Atual:</strong> ${data.current.temp_c}°C</p>
            <p><strong>Condições:</strong> ${data.current.condition.text}</p>
            <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
            <p><strong>Sensação Térmica:</strong> ${data.current.feelslike_c}°C</p>
            <p><strong>Humidade:</strong> ${data.current.humidity}%</p>
            <p><strong>Vento:</strong> ${data.current.wind_kph} km/h</p>
        </div>
    `;
}

function displayForecast(data) {
    const forecastDiv = document.createElement('div');
    forecastDiv.className = 'mt-4';

    let forecastHTML = '<h4>Previsão para os Próximos 3 Dias</h4>';
    data.forecast.forecastday.forEach(day => {
        forecastHTML += `
            <div class="card p-3 mb-3">
                <h5>${day.date}</h5>
                <p><strong>Temperatura Máxima:</strong> ${day.day.maxtemp_c}°C</p>
                <p><strong>Temperatura Mínima:</strong> ${day.day.mintemp_c}°C</p>
                <p><strong>Condições:</strong> ${day.day.condition.text}</p>
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            </div>
        `;
    });

    forecastDiv.innerHTML = forecastHTML;
    document.getElementById('weatherResults').appendChild(forecastDiv);
}
