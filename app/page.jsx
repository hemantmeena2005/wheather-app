'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiFog, WiThunderstorm } from 'react-icons/wi';

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to fetch weather data');
      setWeather(null);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);
      setError(null);
      setCity(cityName); // Set the city to the selected one from suggestions
      setSuggestions([]); // Clear suggestions after selecting a city
    } catch (err) {
      setError('City not found');
      setWeather(null);
    }
  };

  const fetchCitySuggestions = debounce(async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        setSuggestions(response.data);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Geolocation is not enabled or supported');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  const handleCityChange = (e) => {
    const { value } = e.target;
    setCity(value);
    fetchCitySuggestions(value);
  };

  const getWeatherIcon = (description) => {
    switch (description.toLowerCase()) {
      case 'clear sky':
        return <WiDaySunny size={64} />;
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'overcast clouds':
        return <WiCloud size={64} />;
      case 'shower rain':
      case 'rain':
      case 'light rain':
        return <WiRain size={64} />;
      case 'snow':
        return <WiSnow size={64} />;
      case 'mist':
      case 'fog':
        return <WiFog size={64} />;
      case 'thunderstorm':
        return <WiThunderstorm size={64} />;
      default:
        return <WiDaySunny size={64} />;
    }
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-blue-100">
      <h1 className="text-4xl font-bold mb-8">Weather App</h1>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={handleCityChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ul className="bg-white shadow-md rounded-md mt-2 w-full max-w-md">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => fetchWeatherByCity(suggestion.name)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {suggestion.name}, {suggestion.country}
            </li>
          ))}
        </ul>
        <button
          onClick={() => fetchWeatherByCity(city)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {weather && (
        <div className="mt-8 p-6 bg-white shadow-md rounded-md text-center">
          <h2 className="text-2xl font-bold">{weather.name}</h2>
          <div className="flex items-center justify-center my-4">
            {getWeatherIcon(weather.weather[0].description)}
          </div>
          <p className="text-lg">{weather.weather[0].description}</p>
          <p className="text-lg">Temperature: {weather.main.temp}°C</p>
          <p className="text-lg">Humidity: {weather.main.humidity}%</p>
          <p className="text-lg">Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}
