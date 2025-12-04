
'use client';
import { useState, useEffect } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, Wind, Sunrise, Sunset, Droplets, Thermometer,
  Loader2, AlertTriangle, MapPin, Calendar as CalendarIcon, LucideIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type WeatherData = {
  location: string;
  current: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
    windSpeed: number;
    humidity: number;
    apparentTemperature: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    uvIndexMax: number[];
  };
};

const getWeatherIcon = (code: number, isDay: boolean, className: string): JSX.Element => {
  const icons: { [key: number]: LucideIcon } = {
    0: isDay ? Sun : Sun, // Using Sun for both day/night clear
    1: Cloud, 2: Cloud, 3: Cloud,
    45: Cloud, 48: Cloud,
    51: CloudDrizzle, 53: CloudDrizzle, 55: CloudDrizzle,
    61: CloudRain, 63: CloudRain, 65: CloudRain,
    71: CloudSnow, 73: CloudSnow, 75: CloudSnow,
    95: CloudLightning, 96: CloudLightning, 99: CloudLightning
  };
  const Icon = icons[code] || (isDay ? Sun : Sun);
  const color = code >= 95 ? 'text-yellow-400' : code >= 71 ? 'text-blue-300' : code >= 51 ? 'text-blue-400' : 'text-muted-foreground';
  return <Icon className={`${className} ${color}`} />;
};

const getWeatherDescription = (code: number): string => {
  const descriptions: { [key: number]: string } = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown';
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    };

    const fetchWeatherData = async () => {
      setLoading(true);
      if (!navigator.geolocation) {
        setError("Geolocation is not supported. Please enable it in your browser settings.");
        setLoading(false);
        return;
      }

      try {
        const position = await getPosition();
        const { latitude, longitude } = position.coords;

        const params = {
          latitude, longitude,
          current: ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "weather_code", "wind_speed_10m"],
          hourly: ["temperature_2m", "precipitation_probability", "weather_code"],
          daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "uv_index_max"],
          timezone: "auto"
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];

        const current = response.current()!;
        const hourly = response.hourly()!;
        const daily = response.daily()!;
        
        const range = (start: number, stop: number, step: number) =>
            Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

        const hourlyWeatherCodeVar = hourly.variables(2);
        const uvIndexVar = daily.variables(3);
        
        const uvIndexArray = uvIndexVar?.valuesArray();
        const uvIndexValues = uvIndexArray ? Array.from(uvIndexArray) : [];
        const hourlyWeatherCodeArray = hourlyWeatherCodeVar?.valuesArray();
        const hourlyWeatherCodes = hourlyWeatherCodeArray ? Array.from(hourlyWeatherCodeArray) : [];

        setWeather({
          location: "Your Location",
          current: {
            temperature: Math.round(current.variables(0)!.value()),
            humidity: Math.round(current.variables(1)!.value()),
            apparentTemperature: Math.round(current.variables(2)!.value()),
            isDay: current.variables(3)!.value() === 1,
            weatherCode: current.variables(4)!.value(),
            windSpeed: Math.round(current.variables(5)!.value()),
          },
          hourly: {
            time: Array.from({ length: 24 }, (_, i) => format(new Date().setHours(new Date().getHours() + i), 'ha')),
            temperature: Array.from(hourly.variables(0)!.valuesArray()!.slice(0, 24)),
            precipitationProbability: Array.from(hourly.variables(1)!.valuesArray()!.slice(0, 24)),
            weatherCode: hourlyWeatherCodes.slice(0,24),
          },
          daily: {
            time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                (t) => format(new Date(t * 1000), 'EEE')
            ),
            weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
            temperatureMax: Array.from(daily.variables(1)!.valuesArray()!).map(Math.round),
            temperatureMin: Array.from(daily.variables(2)!.valuesArray()!).map(Math.round),
            uvIndexMax: uvIndexValues.map(Math.round),
          }
        });
        setError(null);
      } catch (err: any) {
        console.error("Weather fetch error:", err);
        setError(err.code === 1 ? "Location access denied. Please enable it to see local weather." : "Could not fetch weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-96">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <CardTitle className="text-2xl">Weather Data Unavailable</CardTitle>
        <p className="text-muted-foreground mt-2">{error || "An unknown error occurred."}</p>
      </Card>
    );
  }
  
  const { current, hourly, daily, location } = weather;

  const hourlyChartData = hourly.temperature.map((temp, index) => ({
    time: hourly.time[index],
    Temperature: Math.round(temp),
    Precipitation: hourly.precipitationProbability[index],
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {getWeatherIcon(current.weatherCode, current.isDay, 'w-24 h-24')}
            <div>
              <p className="text-6xl font-bold">{current.temperature}°</p>
              <p className="text-xl text-muted-foreground">{getWeatherDescription(current.weatherCode)}</p>
              <p className="text-sm font-medium flex items-center gap-1"><MapPin className="w-4 h-4" />{location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-center gap-2"><Thermometer className="w-5 h-5 text-primary" /><span className="font-medium">Feels like:</span> {current.apparentTemperature}°</div>
            <div className="flex items-center gap-2"><Wind className="w-5 h-5 text-primary" /><span className="font-medium">Wind:</span> {current.windSpeed} km/h</div>
            <div className="flex items-center gap-2"><Droplets className="w-5 h-5 text-primary" /><span className="font-medium">Humidity:</span> {current.humidity}%</div>
            <div className="flex items-center gap-2"><Sun className="w-5 h-5 text-primary" /><span className="font-medium">UV Index:</span> {daily.uvIndexMax[0] ?? 'N/A'}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hourly Forecast</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
              <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tick={{ fill: 'hsl(var(--primary))' }} label={{ value: '°C', position: 'insideLeft', angle: -90, dy: -10, fill: 'hsl(var(--primary))' }} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" tick={{ fill: 'hsl(var(--secondary))' }} label={{ value: '%', position: 'insideRight', angle: -90, dy: 10, fill: 'hsl(var(--secondary))' }} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
              />
              <Area type="monotone" dataKey="Temperature" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" yAxisId="left" />
              <Area type="monotone" dataKey="Precipitation" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.2)" yAxisId="right" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>7-Day Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {daily.time.map((day, index) => {
                    const minTemp = daily.temperatureMin[index];
                    const maxTemp = daily.temperatureMax[index];
                    const tempSpan = 40; // Assuming a temp range from -10 to 30
                    const barStart = ((minTemp + 10) / tempSpan) * 100;
                    const barWidth = ((maxTemp - minTemp) / tempSpan) * 100;

                    return(
                    <div key={`${day}-${index}`} className="grid grid-cols-[60px_40px_1fr_80px] items-center gap-2">
                        <p className="font-bold text-base">{day}</p>
                        <div className="flex justify-center">
                           {getWeatherIcon(daily.weatherCode[index], true, 'w-8 h-8')}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" style={{ marginLeft: `${barStart}%`, width: `${barWidth}%`}}></div>
                        </div>
                        <p className="font-bold text-base text-right">{minTemp}° / {maxTemp}°</p>
                    </div>
                )})}
            </CardContent>
        </Card>
        <div className="space-y-6">
            
        </div>
      </div>
    </div>
  );
}
