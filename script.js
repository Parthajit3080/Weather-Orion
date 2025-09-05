(() => {
  // Use HTTPS to avoid mixed-content issues
  const API_KEY = "4869fd8401974b08b4e170156250509";
  const BASE = "https://api.weatherapi.com/v1/current.json";

  const $ = (id) => document.getElementById(id);
  const statusEl = $("status");
  const results = $("results");
  const form = $("searchForm");
  const btn = $("goBtn");
  const query = $("query");

  function setText(id, val) { $(id).textContent = val ?? "—"; }
  function fmt(n, digits=1){ return (n===null || n===undefined || Number.isNaN(n)) ? "--" : Number(n).toFixed(digits); }

  function uvClass(v){
    if (v == null) return "";
    if (v < 3) return "ok";
    if (v < 6) return "warn";
    return "bad";
  }

  async function search(q){
    statusEl.classList.remove("hide");
    results.classList.add("hide");
    statusEl.textContent = "Loading…";
    btn.disabled = true;

    try{
      const url = `${BASE}?key=${API_KEY}&q=${encodeURIComponent(q)}&aqi=yes`;
      const res = await fetch(url, { cache: "no-store" });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      render(data);
      statusEl.classList.add("hide");
      results.classList.remove("hide");
    }catch(err){
      console.error(err);
      statusEl.classList.remove("hide");
      statusEl.innerHTML = `<div class="loading">Couldn’t fetch weather. ${err.message}.<br/><span class="muted">Try a different place (e.g., "Paris", "90210", or "51.5,-0.1").</span></div>`;
    }finally{
      btn.disabled = false;
    }
  }

  function render(d){
    const loc = d.location || {};
    const c = d.current || {};
    const cond = (c.condition || {});

    // Header / summary
    const title = `${loc.name ?? ""}${loc.region ? ", " + loc.region : ""}${loc.country ? ", " + loc.country : ""}`;
    setText("locTitle", title);
    $("icon").src = cond.icon ? (cond.icon.startsWith("http") ? cond.icon : "https:" + cond.icon) : "";
    $("icon").alt = cond.text || "Condition";
    setText("tempC", fmt(c.temp_c, 1));
    setText("tempF", fmt(c.temp_f, 1));
    setText("condText", cond.text || "—");
    setText("updated", c.last_updated || "—");
    setText("localtime", loc.localtime || "—");
    setText("tz", loc.tz_id || "—");
    $("dayflag").textContent = c.is_day ? "Daytime" : "Night";
    $("dayflag").style.background = c.is_day ? "#123b2a" : "#231a3b";
    $("dayflag").style.borderColor = "#223158";

    // Wind & pressure
    setText("windKph", fmt(c.wind_kph, 1));
    setText("windMph", fmt(c.wind_mph, 1));
    setText("windDir", c.wind_dir || "—");
    setText("windDeg", fmt(c.wind_degree, 0));
    $("arrow").style.transform = `rotate(${(c.wind_degree||0)}deg)`;
    setText("gustKph", fmt(c.gust_kph, 1));
    setText("gustMph", fmt(c.gust_mph, 1));
    setText("pressMb", fmt(c.pressure_mb, 1));
    setText("pressIn", fmt(c.pressure_in, 2));
    setText("visKm", fmt(c.vis_km, 1));
    setText("visMiles", fmt(c.vis_miles, 1));
    setText("cloud", fmt(c.cloud, 0));
    const uv = c.uv;
    const uvEl = $("uv");
    uvEl.textContent = fmt(uv,1);
    uvEl.className = uvClass(uv);

    setText("precipMm", fmt(c.precip_mm, 1));
    setText("precipIn", fmt(c.precip_in, 2));

    // Thermal
    setText("feelsC", fmt(c.feelslike_c,1));
    setText("feelsF", fmt(c.feelslike_f,1));
    setText("chillC", fmt(c.windchill_c,1));
    setText("chillF", fmt(c.windchill_f,1));
    setText("heatC", fmt(c.heatindex_c,1));
    setText("heatF", fmt(c.heatindex_f,1));
    setText("dewC", fmt(c.dewpoint_c,1));
    setText("dewF", fmt(c.dewpoint_f,1));
    setText("humidity", (c.humidity!=null)? `${c.humidity}%` : "—");

    // Radiation
    setText("shortRad", fmt(c.short_rad,2));
    setText("diffRad", fmt(c.diff_rad,2));
    setText("dni", fmt(c.dni,2));
    setText("gti", fmt(c.gti,2));

    // Air quality
    const aq = c.air_quality || {};
    setText("epaIdx", aq["us-epa-index"] ?? "—");
    setText("defraIdx", aq["gb-defra-index"] ?? "—");
    setText("co", fmt(aq.co,1));
    setText("no2", fmt(aq.no2,2));
    setText("o3", fmt(aq.o3,1));
    setText("so2", fmt(aq.so2,2));
    setText("pm25", fmt(aq.pm2_5,3));
    setText("pm10", fmt(aq.pm10,3));
  }
    // Default weather cards
  const defaultCities = ["Kolkata", "New Delhi", "New York"];
  const defaultContainer = $("defaultWeather");

  async function fetchWeather(city) {
    const url = `${BASE}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
    const res = await fetch(url);
    return res.json();
  }

  async function loadDefaultWeather() {
    defaultContainer.innerHTML = "";
    for (let city of defaultCities) {
      try {
        const data = await fetchWeather(city);
        const c = data.current;
        defaultContainer.innerHTML += `
          <div class="weather-card">
            <img src="https:${c.condition.icon}" alt="${c.condition.text}">
            <h2>${data.location.name}</h2>
            <p>${data.location.country}</p>
            <div class="temp">${c.temp_c}°C</div>
            <p>${c.condition.text}</p>
            <p>Humidity: ${c.humidity}%</p>
            <p>Wind: ${c.wind_kph} kph</p>
          </div>
        `;
      } catch (err) {
        console.error("Error loading city:", city, err);
      }
    }
  }
  

  // Call immediately on page load
  loadDefaultWeather();

  // Demo: prefill with London on first load (optional)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    search(query.value.trim());
  });
})();