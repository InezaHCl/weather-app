"use client";
import { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

export default function Home() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState({});
  const [displayFlag, setDisplayflag] = useState("");

  async function handleFetchWeather() {
    try {
      setIsLoading(true);
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results) {
        alert("Location not Found");
        throw new Error("Location not Found");
      }
      // console.log(geoData);

      const {
        latitude: lat,
        longitude: lng,
        name,
        timezone,
        country_code,
      } = geoData.results.at(0);

      setLocation(name);
      setDisplayflag(`${name} ${convertToFlag(country_code)}`);

      // Fetching actual Weather data
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();

      setWeather(weatherData.daily);
      // console.log(weatherData.daily);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center w-10/12 gap-6 p-10 border-2 border-black outline outline-offset-2 outline-2 outline-black">
        <h1 className="font-semibold text-5xl tracking-normal uppercase">
          Cool Weather
        </h1>

        <div>
          <input
            type="text"
            value={location}
            onChange={(el) => setLocation(el.target.value)}
            disabled={isLoading}
            placeholder="search from location"
            className="text-md text-black bg-white py-2 px-4 placeholder:uppercase placeholder:text-light_dark"
          />
          <button
            onClick={handleFetchWeather}
            className="bg-secondary text-black py-2 px-4 rounded-e-lg hover:cursor-pointer hover:bg-secondary_light"
          >
            SEARCH
          </button>
        </div>

        {isLoading && <p className="text-2xl font-semibold">Loading...</p>}

        {/* Weather component */}
        {weather.weathercode && (
          <Weather flag={displayFlag} weather={weather} />
        )}
      </div>
    </main>
  );
}

function Weather({ flag, weather }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: code,
  } = weather;
  return (
    <div>
      <h2 className="text-white text-2xl text-center mb-4">
        WEATHER in {flag}
      </h2>

      <ul className="list-none flex gap-7">
        {dates.map((date, i) => (
          <Day
            maxTemp={max.at(i)}
            minTemp={min.at(i)}
            day={formatDay(date)}
            icon={getWeatherIcon(code.at(i))}
            key={date}
            isToday={i === 0}
          />
        ))}
      </ul>
    </div>
  );
}

function Day({ maxTemp, minTemp, day, icon, isToday }) {
  return (
    <li className="px-5 py-4 text-center bg-[#087f5b] hover:cursor-pointer border">
      {isToday ? (
        <p className="text-white">Today</p>
      ) : (
        <p className="text-white">{day}</p>
      )}

      <span className="text-2xl">{icon}</span>

      <p className="text-white">
        {Math.floor(minTemp)}&deg; &mdash;{" "}
        <strong>{Math.ceil(maxTemp)}&deg;</strong>
      </p>
    </li>
  );
}

// How to run scripts
// npm run dev: runs next dev to start Next.js in development mode.
// build: runs next build to build the application for production usage.
// start: runs next start to start a Next.js production server.
// lint: runs next lint to set up Next.js' built-in ESLint configuration.
