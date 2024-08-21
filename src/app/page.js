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
  const [home, setHome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState({});
  const [displayFlag, setDisplayflag] = useState("");
  const [geoPosition, setGeoPosition] = useState({});

  useEffect(() => {
    async function fetchCityData() {
      if (geoPosition.lat && geoPosition.lng) {
        setIsLoading(true);
        console.log(geoPosition.lat, geoPosition.lng);
        try {
          const cityRes = await fetch(
            `https://geocode.xyz/${geoPosition.lat},${geoPosition.lng}?geoit=json`
          );
          const cityData = await cityRes.json();
          console.log(cityData);
          console.log(cityData.city);
          setLocation(cityData.city);
          setHome(cityData.city);
        } catch (err) {
          console.error(err);
        }
      }
    }

    fetchCityData();
  }, [geoPosition]);

  useEffect(function () {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(pos);
        setGeoPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => {
        alert(`${error.message}`);
        return;
      }
    );
  }, []);

  // Fetch weather data when the location is updated
  useEffect(() => {
    if (home) {
      fetchWeather(home);
      setIsLoading(false);
    }
  }, [home]);

  function handleSubmit(e) {
    e.preventDefault();

    fetchWeather();
  }

  async function fetchWeather() {
    try {
      setIsLoading(true);
      console.log("First Search:", location);
      // console.log(location);
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
      setLocation("");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center my-3">
      <div className="flex flex-col items-center w-11/12 md:w-10/12 gap-6 p-4 md:p-10 border-2 border-black outline outline-offset-2 outline-2 outline-black">
        <h1 className="font-semibold text-2xl md:text-5xl tracking-normal uppercase">
          classy forecast <span>🌍</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center"
        >
          <input
            type="text"
            value={location || ""}
            onChange={(el) => setLocation(el.target.value)}
            disabled={isLoading}
            placeholder="search from location"
            className="md:text-md text-black bg-white py-2 px-4 w-10/12 rounded-s-lg focus:outline-none placeholder:uppercase placeholder:text-light_dark placeholder:text-sm"
          />
          <button
            type="submit"
            className="bg-secondary text-black py-2 px-2 md:py-2 md:px-4 rounded-e-lg hover:cursor-pointer hover:bg-secondary_light"
          >
            SEARCH
          </button>
        </form>

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
    <div className="w-full">
      <h2 className="text-white text-xl font-semibold md:text-2xl text-center mb-4">
        WEATHER in {flag}
      </h2>

      {/* flex gap-7 */}
      <ul className="list-none grid grid-cols-1 md:grid-cols-4 gap-3 ">
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
    <li className="px-5 py-4 text-center bg-primary_dark hover:cursor-pointer border">
      {isToday ? (
        <p className="text-xl font-semibold text-secondary_lighter">Today</p>
      ) : (
        <p className="text-xl font-semibold text-secondary_lighter">{day}</p>
      )}

      <span className="text-3xl">{icon}</span>

      <p className="text-white text-xl">
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

//////////////////////////////////////////////////////////
// TODO: https://geocode.xyz/${lat},${lng}?geoit=json
// Example:
// fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
//     .then(res => {
//       if (!res.ok) throw new Error(`Problem with geocoding ${res.status}`);
//       return res.json();
//     })
//     .then(data => {
//       console.log(data);
//       console.log(`You are in ${data.city}, ${data.country}`);
