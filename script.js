// SIMPLE WEATHER APP - FROM SCRATCH
// Replace 'YOUR_API_KEY_HERE' with your actual OpenWeatherMap API key

// ============================
// CONFIGURATION - EDIT THIS PART
// ============================
const API_KEY = "6e39054ced13fe545374d6e6108eb2dd";  // ← REPLACE WITH YOUR KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ============================
// DOM ELEMENTS
// ============================
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const weatherContent = document.getElementById('weather-content');
const errorDiv = document.getElementById('error');
const errorMsg = document.getElementById('error-msg');

// Weather display elements
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const temp = document.getElementById('temp');
const unit = document.getElementById('unit');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const conditions = document.getElementById('conditions');

// ============================
// APP STATE
// ============================
let isCelsius = true;
let currentData = null;

// ============================
// INITIALIZE APP
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Set current date and time
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
    
    // Load default city (London)
    fetchWeatherByCity('London');
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    locationBtn.addEventListener('click', handleLocation);
    
    // Temperature unit toggle
    temp.addEventListener('click', toggleUnit);
    unit.addEventListener('click', toggleUnit);
});

// ============================
// EVENT HANDLERS
// ============================
function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherByCity(city);
    cityInput.value = '';
}

function handleLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        },
        (error) => {
            hideLoading();
            showError('Unable to retrieve your location. Please enable location permissions.');
            console.error('Geolocation error:', error);
        }
    );
}

// ============================
// WEATHER DATA FUNCTIONS
// ============================
async function fetchWeatherByCity(city) {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check spelling.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        }
        
        const data = await response.json();
        currentData = data;
        displayWeather(data);
        
    } catch (error) {
        showError(error.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather for your location');
        }
        
        const data = await response.json();
        currentData = data;
        displayWeather(data);
        
    } catch (error) {
        showError(error.message);
    }
}

// ============================
// DISPLAY FUNCTIONS
// ============================
function displayWeather(data) {
    // Update location
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // Convert temperatures based on current unit
    let displayTemp = isCelsius ? data.main.temp : celsiusToFahrenheit(data.main.temp);
    let displayFeelsLike = isCelsius ? data.main.feels_like : celsiusToFahrenheit(data.main.feels_like);
    
    // Update temperature displays
    temp.textContent = Math.round(displayTemp);
    unit.textContent = isCelsius ? '°C' : '°F';
    feelsLike.textContent = `${Math.round(displayFeelsLike)}°${isCelsius ? 'C' : 'F'}`;
    
    // Update weather icon and description
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    weatherDesc.textContent = data.weather[0].description;
    
    // Update other details
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    conditions.textContent = data.weather[0].main;
    
    // Show weather content
    hideLoading();
    weatherContent.classList.remove('hidden');
}

function toggleUnit() {
    isCelsius = !isCelsius;
    
    if (currentData) {
        // Convert and update temperatures
        let displayTemp = isCelsius ? currentData.main.temp : celsiusToFahrenheit(currentData.main.temp);
        let displayFeelsLike = isCelsius ? currentData.main.feels_like : celsiusToFahrenheit(currentData.main.feels_like);
        
        temp.textContent = Math.round(displayTemp);
        unit.textContent = isCelsius ? '°C' : '°F';
        feelsLike.textContent = `${Math.round(displayFeelsLike)}°${isCelsius ? 'C' : 'F'}`;
    }
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

// ============================
// UI STATE FUNCTIONS
// ============================
function showLoading() {
    loading.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    errorDiv.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMsg.textContent = message;
    errorDiv.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    loading.classList.add('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// ============================
// HELPER FUNCTIONS
// ============================
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// ============================
// SIMPLE API KEY VALIDATION
// ============================
function validateApiKey() {
    if (API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("⚠️ WARNING: You need to add your OpenWeatherMap API key!");
        console.warn("1. Go to https://openweathermap.org/ and sign up for free");
        console.warn("2. Get your API key from the dashboard");
        console.warn("3. Replace 'YOUR_API_KEY_HERE' in script.js with your actual key");
        
        // Show a gentle reminder in the UI
        const reminder = document.createElement('div');
        reminder.style.background = '#fff3cd';
        reminder.style.border = '1px solid #ffeaa7';
        reminder.style.borderRadius = '10px';
        reminder.style.padding = '15px';
        reminder.style.marginTop = '20px';
        reminder.style.color = '#856404';
        reminder.innerHTML = `
            <strong><i class="fas fa-exclamation-triangle"></i> API Key Needed:</strong> 
            Please add your OpenWeatherMap API key to make the app work. 
            See instructions below.
        `;
        document.querySelector('.instructions').prepend(reminder);
    }
}

// Run validation on load
validateApiKey();