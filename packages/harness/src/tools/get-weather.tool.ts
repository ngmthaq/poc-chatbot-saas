import { z } from 'zod';
import type {
  GeocodingResponse,
  WeatherForecastResponse,
} from '../types/get-weather';
import { dedent, fetchWithTimeout } from '../utils/index';
import { BaseTool } from './base/base-tool';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO weather interpretation codes (https://open-meteo.com/en/docs)
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'heavy freezing rain',
  71: 'slight snowfall',
  73: 'moderate snowfall',
  75: 'heavy snowfall',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
};

const getWeatherSchema = z.object({
  location: z
    .string()
    .describe(
      'The location to look up weather information for (e.g. city name)',
    ),
});

export class GetWeatherTool extends BaseTool<typeof getWeatherSchema> {
  public readonly name = 'getWeather';

  public readonly description = dedent`
        Use this tool to look up current weather information in the given location.
        If the location is not supported by the weather service, the tool will indicate this.
        You must tell the user the location's weather is unavailable.
    `;

  public readonly schema = getWeatherSchema;

  public async execute({
    location,
  }: z.infer<typeof getWeatherSchema>): Promise<string> {
    console.log(`Looking up weather for ${location}`);

    try {
      // 1. Resolve the location name to coordinates.
      const geocodingUrl = new URL(GEOCODING_URL);
      geocodingUrl.searchParams.set('name', location);
      geocodingUrl.searchParams.set('count', '1');
      geocodingUrl.searchParams.set('language', 'en');
      geocodingUrl.searchParams.set('format', 'json');

      const geocodingResponse = await fetchWithTimeout(geocodingUrl);
      if (!geocodingResponse.ok) {
        throw new Error(
          `Geocoding request failed: ${geocodingResponse.status}`,
        );
      }

      const geocoding = (await geocodingResponse.json()) as GeocodingResponse;
      const place = geocoding.results?.[0];
      if (!place) {
        return `The weather for "${location}" is unavailable because the location could not be found.`;
      }

      // 2. Fetch the current weather for those coordinates.
      const forecastUrl = new URL(FORECAST_URL);
      forecastUrl.searchParams.set('latitude', String(place.latitude));
      forecastUrl.searchParams.set('longitude', String(place.longitude));
      forecastUrl.searchParams.set(
        'current',
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      );

      const forecastResponse = await fetchWithTimeout(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error(`Forecast request failed: ${forecastResponse.status}`);
      }

      const forecast =
        (await forecastResponse.json()) as WeatherForecastResponse;
      const current = forecast.current;
      if (!current) {
        return `The weather for ${place.name} is unavailable right now.`;
      }

      const units = forecast.current_units ?? {};
      const condition =
        WEATHER_CODE_DESCRIPTIONS[current.weather_code] ?? 'unknown conditions';
      const placeLabel = [place.name, place.admin1, place.country]
        .filter(Boolean)
        .join(', ');

      return dedent`
        Current weather in ${placeLabel}: ${condition}.
        Temperature: ${current.temperature_2m}${units.temperature_2m ?? '°C'} (feels like ${current.apparent_temperature}${units.apparent_temperature ?? '°C'}).
        Humidity: ${current.relative_humidity_2m}${units.relative_humidity_2m ?? '%'}.
        Wind speed: ${current.wind_speed_10m}${units.wind_speed_10m ?? ' km/h'}.
      `;
    } catch (error) {
      console.error(`Failed to look up weather for ${location}:`, error);
      return `The weather for "${location}" is unavailable due to a service error.`;
    }
  }
}
