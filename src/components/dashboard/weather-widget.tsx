'use client';
import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, Wind, Loader2, Moon, MapPin, AlertTriangle } from 'lucide-react';
import { fetchWeatherApi } from 'openmeteo';

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  wind: string;
  timeOfDay: 'day' | 'night';
}

const getWeatherIcon = (code: number, isDay: boolean) => {
    switch (code) {
        case 0: // Clear sky
            return isDay ? <Sun className="w-12 h-12 text-yellow-400" /> : <Moon className="w-12 h-12 text-blue-300" />;
        case 1: // Mainly clear
        case 2: // partly cloudy
        case 3: // overcast
            return <Cloud className="w-12 h-12 text-muted-foreground" />;
        case 45: // Fog
        case 48: // depositing rime fog
            return <Cloud className="w-12 h-12 text-gray-400" />;
        case 51: // Drizzle: Light
        case 53: // Drizzle: moderate
        case 55: // Drizzle: dense intensity
            return <CloudDrizzle className="w-12 h-12 text-blue-400" />;
        case 61: // Rain: Slight
        case 63: // Rain: moderate
        case 65: // Rain: heavy intensity
            return <CloudRain className="w-12 h-12 text-blue-500" />;
        case 71: // Snow fall: Slight
        case 73: // Snow fall: moderate
        case 75: // Snow fall: heavy intensity
            return <CloudSnow className="w-12 h-12 text-white" />;
        case 95: // Thunderstorm: Slight or moderate
        case 96: // Thunderstorm with slight hail
        case 99: // Thunderstorm with heavy hail
            return <CloudLightning className="w-12 h-12 text-yellow-500" />;
        default:
            return <Sun className="w-12 h-12 text-yellow-400" />;
    }
};

const getWeatherInfoText = (code: number) => {
    switch (code) {
        case 0: return "Atmosphere clear. Optimal visibility.";
        case 1: case 2: case 3: return "Cloud cover detected. Visibility may be reduced.";
        case 45: case 48: return "Fog detected. Low visibility warning.";
        case 51: case 53: case 55: return "Drizzle reported. Light precipitation.";
        case 61: case 63: case 65: return "Precipitation warning. Acid rain possible.";
        case 71: case 73: case 75: return "Freezing temperatures detected. Thermal gear recommended.";
        case 95: case 96: case 99: return "Ionospheric disturbance. Electrical storm in progress.";
        default: return "Weather data nominal.";
    }
}


export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    const fetchWeatherData = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        try {
            const position = await getPosition();
            const { latitude, longitude } = position.coords;

            const params = {
                latitude,
                longitude,
                current: ["temperature_2m", "is_day", "weather_code", "wind_speed_10m"],
                hourly: "temperature_2m",
                timezone: "auto"
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];
            
            const current = response.current()!;

            const temp = Math.round(current.variables(0)!.value());
            const isDay = current.variables(1)!.value() === 1;
            const weatherCode = current.variables(2)!.value();
            const windSpeed = Math.round(current.variables(3)!.value());

            setWeather({
                location: 'Your Location',
                temperature: `${temp}°C`,
                condition: getWeatherInfoText(weatherCode),
                wind: `${windSpeed} km/h`,
                timeOfDay: isDay ? 'day' : 'night',
            });
            setError(null);

        } catch (err: any) {
            console.error(err);
            if(err.code === 1) { // User denied Geolocation
                 setError("Location access denied. Displaying default weather.");
                 setWeather({
                    location: 'Night City',
                    temperature: '24°C',
                    condition: 'Clear',
                    wind: '12 km/h',
                    timeOfDay: 'night',
                 });
            } else {
                 setError("Could not fetch weather data.");
            }
        } finally {
            setLoading(false);
        }
    }

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Acquiring weather data...</p>
      </div>
    );
  }
  
  if (!weather) return (
     <div className="flex flex-col items-center justify-center h-full text-destructive">
        <AlertTriangle className="w-8 h-8" />
        <p className="ml-2 mt-2 font-semibold">{error || "Failed to load weather."}</p>
      </div>
  );


  const weatherCode = isNaN(parseInt(weather.condition.split(' ')[0], 10)) ? 0 : parseInt(weather.condition.split(' ')[0], 10);
  const isDay = weather.timeOfDay === 'day';
  const locationText = weather.location;

  return (
    <div className="flex flex-col justify-between h-full" data-onboarding-id="weather-widget">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                {getWeatherIcon(weatherCode, isDay)}
                <div>
                <p className="text-3xl font-bold">{weather.temperature}</p>
                <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4"/>
                    {locationText}
                </p>
                </div>
            </div>
            <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                <Wind className="w-4 h-4" />
                {weather.wind}
                </p>
            </div>
        </div>
        <div className="mt-4 text-center border-t-2 border-primary/20 pt-4">
             <p className="text-sm text-primary font-mono tracking-widest uppercase">
                {weather.timeOfDay} - {weather.condition}
             </p>
        </div>
    </div>
  );
}
