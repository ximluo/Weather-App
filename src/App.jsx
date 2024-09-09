import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import dayPartlyCloudy from './assets/Day_Clouds.webp';
import daySunny from './assets/Day_Sun.webp';
import dayLightRain from './assets/Day_Rain.webp';
import dayOvercast from './assets/Day_Wind.webp';
import daySnow from './assets/Day_Snow.webp';
import dayThunderstorm from './assets/Day_Storm.webp';
import dayDefault from './assets/Day_Sun.webp'; 
import nightPartlyCloudy from './assets/Night_Clouds.webp';
import nightClear from './assets/Night_Moon.webp';
import nightLightRain from './assets/Night_Rain.webp';
import nightOvercast from './assets/Night_Wind.webp';
import nightSnow from './assets/Night_Snow.webp';
import nightThunderstorm from './assets/Night_Storm.webp';
import nightDefault from './assets/Night_Moon.webp'; 
import './App.css';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const api = {
  key: process.env.REACT_APP_WEATHER_API_KEY,
  base: "https://api.weatherapi.com/v1/"
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [hourlyData, setHourlyData] = useState([]);
  const [error, setError] = useState(null); 
  const [localTime, setLocalTime] = useState(''); 

  useEffect(() => {
    if (weather.forecast) {
      console.log("Weather forecast found:", weather.forecast.forecastday[0].hour);
      setHourlyData(weather.forecast.forecastday[0].hour); 
      setLocalTime(weather.location.localtime); 
    }
  }, [weather]);

  const search = (evt) => {
    if (evt.key === "Enter") {
      fetch(`${api.base}forecast.json?key=${api.key}&q=${query}&days=7&aqi=yes`)
        .then((res) => res.json())
        .then((result) => {
          if (result.error) {
            setError(result.error.message); 
            console.error("Error fetching weather:", result.error.message);
          } else {
            setWeather(result);
            setQuery('');
            setError(null); 
          }
        })
        .catch((err) => {
          setError("An error occurred while fetching the weather data.");
          console.error("API Fetch error:", err);
        });
    }
  };

  const getIcon = (condition, is_day) => {
    if (is_day === 1) {
      if (condition.includes("Sunny")) {
        return daySunny;
      } else if (condition.includes("Clear")) {
        return daySunny;
      } else if (condition.includes("Partly cloudy")) {
        return dayPartlyCloudy;
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        return dayLightRain;
      } else if (condition.includes("Overcast")) {
        return dayOvercast;
      } else if (condition.includes("snow")) {
        return daySnow;
      } else if (condition.includes("thunder")) {
        return dayThunderstorm;
      } else {
        return dayDefault; 
      }
    } else {
      if (condition.includes("Clear")) {
        return nightClear;
      } else if (condition.includes("Partly cloudy")) {
        return nightPartlyCloudy;
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        return nightLightRain;
      } else if (condition.includes("Overcast")) {
        return nightOvercast;
      } else if (condition.includes("snow")) {
        return nightSnow;
      } else if (condition.includes("thunder")) {
        return nightThunderstorm;
      } else {
        return nightDefault; 
      }
    }
  };

  const getBackground = () => {
    if (typeof weather.current !== "undefined") {
      return weather.current.is_day ? 'App-day' : 'App-night';
    }
    return 'App-mild'; 
  };

  const HourlyForecast = ({ hourlyData }) => {
    const localTime = new Date(weather.location.localtime).getHours(); 
  
    const formatTimeLabel = (hour, index) => {
      const time = hour % 24;
      return time === 0 ? '12 AM' :
        time < 12 ? `${time} AM` :
          time === 12 ? '12 PM' : `${time - 12} PM`;
    };
  
    return (
      <div className="hourly-forecast-container">
        <div className="hourly-forecast">
          {hourlyData.slice(localTime, localTime + 6).map((hour, index) => (
            <div key={index} className="hourly-forecast-item">
              <div>{formatTimeLabel(new Date(hour.time).getHours(), index)}</div>
              <img className="hourly-icon" src={getIcon(hour.condition.text, weather.current.is_day)} alt="weather icon" />
              <div>{hour.temp_f}°F</div>
              {hour.chance_of_rain > 0 && (
                <div>{hour.chance_of_rain}%</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TemperatureChart = ({ hourlyData }) => {
    const next24Hours = hourlyData.slice(0, 24);
    const currentHour = new Date(weather.location.localtime).getHours();
    const maxTemp = Math.max(...next24Hours.map(item => item.temp_f));
    const minTemp = Math.min(...next24Hours.map(item => item.temp_f));
  
    const formatTimeLabel = (hour) => {
      if (hour === 0) return '12 AM';
      if (hour === 6) return '6 AM';
      if (hour === 12) return '12 PM';
      if (hour === 18) return '6 PM';
      return '';
    };
  
    const labels = next24Hours.map((item, index) => formatTimeLabel(new Date(item.time).getHours()));
    const temps = next24Hours.map(item => item.temp_f);
  
    const data = {
      labels, 
      datasets: [
        {
          label: 'Temperature',
          data: temps, 
          borderColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, '#FFA500'); 
            gradient.addColorStop(1, '#00BFFF'); 
            return gradient;
          },
          backgroundColor: 'rgba(0,0,0,0)', 
          fill: false, 
          pointRadius: next24Hours.map((item, index) =>
            item.temp_f === maxTemp || item.temp_f === minTemp || index === currentHour ? 6 : 0), 
          pointBackgroundColor: '#fff', 
          pointStyle: next24Hours.map((item, index) =>
            index === currentHour ? 'circle' : 'star'), 
          pointBorderColor: '#fff', 
          pointBorderWidth: 2, 
        },
      ],
    };
  
    const options = {
      scales: {
        y: {
          ticks: {
            callback: (value) => `${value}°`, 
            color: '#fff',
          },
          title: {
            display: false,
            text: 'Temperature (°F)',
          },
        },
        x: {
          ticks: {
            autoSkip: false, 
            maxRotation: 0, 
            callback: function(value, index) {
              return labels[index] !== '' ? labels[index] : null; 
            },
            color: '#fff',
            font: {
              size: 12, 
            },
          },
          grid: {
            display: false, 
          },
        },
      },
      plugins: {
        tooltip: {
          enabled: false, 
        },
        legend: {
          display: false, 
        },
      },
      elements: {
        point: {
          radius: next24Hours.map((item, index) =>
            index === currentHour ? 6 : (item.temp_f === maxTemp || item.temp_f === minTemp ? 6 : 0)), 
          backgroundColor: '#fff', 
        },
      },
      animation: {
        duration: 0, 
      },
    };
  
    return <Line data={data} options={options} />;
  };

  const render7DayForecast = () => {
    if (!weather.forecast) {
      return <p>No forecast available.</p>;
    }
    return weather.forecast.forecastday.slice(0, 3).map((day) => (
      <div className="forecast-day" key={day.date}>
       <div className="forecast-day-label">{new Date(new Date(day.date).setDate(new Date(day.date).getDate() + 1)).toLocaleDateString('en-US', { weekday: 'short' })}
</div>
        <img className="forecast-icon" src={getIcon(day.day.condition.text, weather.current.is_day)} alt="weather icon" />
        <div className="forecast-day-temp">
          <span>{Math.round(day.day.maxtemp_f)}°F</span>
        </div>
        <div className="forecast-day-temp">
          <span>{Math.round(day.day.mintemp_f)}°F</span>
        </div>
      </div>
    ));
  };

  return (
    <div className={getBackground()}>
      <main>
        {typeof weather.current !== "undefined" ? (
          <div>
            <div className="location-box">
              <div className="city">{weather.location.name}</div>
              <div className="localtime">Local Time: {localTime}</div> {}
            </div>
            <div className="weather-box">
              <div className="weather-icon">
                <img className="icon" src={getIcon(weather.current.condition.text, weather.current.is_day)} alt="weather icon" />
              </div>
              <div className="temp">{Math.round(weather.current.temp_f)}˚F</div>
              <div className="weather">{weather.current.condition.text}</div>
            </div>

            {hourlyData.length > 0 && <HourlyForecast hourlyData={hourlyData} />}
            {hourlyData.length > 0 && <TemperatureChart hourlyData={hourlyData} />}

            <div className="forecast-container">
              <div className="forecast-grid">
                {weather.forecast && render7DayForecast()}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {error ? <p className="error-message">{error}</p> : <p>Please search for a location.</p>}
          </div>
        )}
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search city..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onKeyPress={search}
          />
        </div>
      </main>
    </div>
  );
}

export default App;