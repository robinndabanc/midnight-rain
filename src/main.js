
import "./style.css";
import * as Astronomy from "astronomy-engine";

// --------------------------------------------------
// 1. LOCATION
// --------------------------------------------------

let location = {
  name: "Melbourne, Australia",
  latitude: -37.8136,
  longitude: 144.9631,
  elevation: 0,
  timeZone: "Australia/Melbourne",
};

const $ = (id) => document.getElementById(id);

const moonCanvas = $("moon-canvas");
const moonContext = moonCanvas.getContext("2d");
const moonButton = $("moon-button");
const moonTexture = new Image();

moonTexture.onload = () => {
  updateApp();
};

moonTexture.onerror = () => {
  console.error("Could not load moon texture.png");
};

moonTexture.src = "/moon texture.png";

const moonShadowTexture = new Image();

moonShadowTexture.onload = () => {
  console.log("Moon shadow texture loaded!");
  updateApp();
};

moonShadowTexture.onerror = () => {
  console.error("Moon shadow texture failed to load:", moonShadowTexture.src);
};

moonShadowTexture.src = "/moon shadow.png";


const message = $("message");

// --------------------------------------------------
// 2. MOON PHASE
// --------------------------------------------------

function getMoonPhase(date) {
  const angle = Astronomy.MoonPhase(date);

  const phases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];

  const index = Math.floor((angle + 22.5) / 45) % 8;
  const radians = (angle * Math.PI) / 180;
  const illumination = (1 - Math.cos(radians)) / 2;

  return {
    angle,
    name: phases[index],
    illumination: Math.round(illumination * 100),
  };
}

// --------------------------------------------------
// 3. DRAW THE MOON
// --------------------------------------------------

function drawMoon(angle) {
  const ctx = moonContext;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const size = moonCanvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;

  const style = getComputedStyle(document.body);
  const moonLit = style.getPropertyValue("--moon-lit").trim();
  const moonShadow = style.getPropertyValue("--moon-shadow").trim();

  ctx.clearRect(0, 0, size, size);

  // Dark side of the lunar disc.
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = moonShadow;
  ctx.fill();

  // Draw the shadow texture across the entire lunar disc.
  if (moonShadowTexture.complete && moonShadowTexture.naturalWidth > 0) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(moonShadowTexture, 0, 0, size, size);

    ctx.restore();
  }

  const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;

  // Clip the illuminated portion to the lunar disc.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (illumination > 0.002) {
 
if (illumination > 0.002) {
  const waxing = angle < 180;

  // Full Moon: draw the bright texture across the whole disc.
  if (Math.abs(angle - 180) < 0.5) {
    if (moonTexture.complete && moonTexture.naturalWidth > 0) {
      ctx.drawImage(moonTexture, 0, 0, size, size);
    } else {
      ctx.fillStyle = moonLit;
      ctx.fill();
    }
  } else {
    const radians = (angle * Math.PI) / 180;
    const cosine = Math.cos(radians);
    const width = Math.abs(cosine) * r;

    const crescent = angle < 90 || angle > 270;
    const bulgeRight = crescent ? waxing : !waxing;
    const bulge = (bulgeRight ? 1 : -1) * width;

    ctx.save();
    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      -Math.PI / 2,
      Math.PI / 2,
      !waxing
    );

    ctx.bezierCurveTo(
      cx + bulge * 1.10,
      cy + r * 0.55,
      cx + bulge * 1.10,
      cy - r * 0.55,
      cx,
      cy - r
    );

    ctx.closePath();
    ctx.clip();

    if (moonTexture.complete && moonTexture.naturalWidth > 0) {
      ctx.drawImage(moonTexture, 0, 0, size, size);
    } else {
      ctx.fillStyle = moonLit;
      ctx.fill();
    }

    ctx.restore();
  }
}

ctx.closePath();
 }

  ctx.restore();
  requestAnimationFrame(() => {
  document.body.classList.add("moon-ready");
});
};


// --------------------------------------------------
// 4. DAY AND NIGHT THEMES
// --------------------------------------------------

function getSunAltitude(date, observer) {
  const equator = Astronomy.Equator(
    Astronomy.Body.Sun,
    date,
    observer,
    true,
    true
  );

  return Astronomy.Horizon(
    date,
    observer,
    equator.ra,
    equator.dec,
    "normal"
  ).altitude;
}

// Personalised greetings
const greetings = {
  xavier: "Xavier",
  viv: "Viv",
  mimi: "Mimi",
  brian: "Brian",
  wendy: "Wendy",
  hayley: "Hayley",
  ralph: "Ralph",
};

// Read the recipient from the website link
const urlParams = new URLSearchParams(window.location.search);

const recipient = urlParams.get("to")?.toLowerCase();

const greetingName = greetings[recipient] || "Stargazer";

function getTimeGreeting(now) {
  // Uses the visitor's own device time
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "GOOD MORNING";
  } else if (hour >= 12 && hour < 17) {
    return "GOOD AFTERNOON";
  } else if (hour >= 17 && hour < 21) {
    return "GOOD EVENING";
  } else {
    return "GOOD NIGHT";
  }
}

function updateTheme(altitude) {
  let theme;
  let status;

  if (altitude > 6) {
    theme = "day";
    status = "A LITTLE DAYTIME MAGIC";
  } else if (altitude > 0) {
    theme = "dawn";
    status = "A NEW DAY IS BEGINNING";
  } else if (altitude > -6) {
    theme = "dusk";
    status = "BETWEEN LIGHT AND DARK";
  } else {
    theme = "night";
    status = "A LITTLE NIGHTTIME MAGIC";
  }

  document.body.dataset.theme = theme;

  // Personalised greeting
 const timeGreeting = getTimeGreeting(new Date());
 const skyStatus = $("sky-status");
 
 if (greetings[recipient]) {
  skyStatus.textContent =
    `${timeGreeting}, ${greetingName.toUpperCase()}`;

  // Add a decorative twinkling star
  const star = document.createElement("span");
  star.className = "greeting-star";
  star.textContent = "✦";
  star.setAttribute("aria-hidden", "true");

  skyStatus.append(" ", star);
} else {
  skyStatus.textContent = "A LITTLE MOMENT OF MAGIC";
}

  // Update the browser theme colour to match the atmosphere.
  const themeColors = {
    day: "#f4ece3",
    dawn: "#f1e2d8",
    dusk: "#e7d9df",
    night: "#17182d",
  };

  document.querySelector('meta[name="theme-color"]').content =
    themeColors[theme];
}

// --------------------------------------------------
// 5. MOON FORTUNES
// --------------------------------------------------

const moonFortunes = [
  "You don't have to have everything figured out tonight.",
  "Something lovely may find you when you least expect it.",
  "Give yourself permission to begin again.",
  "Even the smallest steps carry you somewhere new.",
  "You are allowed to rest without earning it.",
  "Let go of what no longer feels like yours to carry.",
  "There is still a little magic waiting for you.",
  "Trust the quiet feeling that tells you to slow down.",
  "You are growing, even when you cannot see it.",
  "A new chapter can begin with one gentle choice.",
  "Make room for the things that make you feel alive.",
  "You deserve the same kindness you give to others.",
  "Not every unanswered question needs an answer tonight.",
  "Some things take time to bloom. Let yourself, too.",
  "May tomorrow bring you a little more light.",
  "You can be a work in progress and still be wonderful.",
  "Let curiosity lead you somewhere unexpected.",
  "You do not need to rush what is becoming.",
  "There is no single right way to find your way.",
  "Tonight, give yourself permission to simply be."
  "You are allowed to grow at your own pace. Even the moon takes its time becoming full."
"Somewhere in your future is a version of you who is so glad you kept going."
"You haven't missed your moment. Some beautiful things simply take longer to find us."
"Even on the days you feel invisible, your existence makes someone's world a little brighter."
"You don't have to have everything figured out to be heading somewhere wonderful."
"May the days ahead be kinder to you than the ones you've left behind."
"There is still so much love in this world that hasn't found its way to you yet."
"One day, the things that feel so heavy now will become stories you tell with a lighter heart."
"You deserve a life that feels as gentle as the love you give to others."
"Somewhere along the way, you'll realise you've become the person you once needed."
"If all you did today was make it through, the moon is still proud of you."
"Not every chapter needs to be beautiful for your story to become something wonderful."
"You are not falling behind. You are living a life that was never meant to look like anyone else's."
"Even the longest nights eventually surrender to morning. Yours will, too."
"May you find the courage to begin again, even if beginning means taking one tiny step."
"The world will not ask you to be strong forever. Softer days are coming."
"It's okay if your light feels dim tonight. Even the smallest glow can guide you home."
"You have survived every version of yourself that thought they couldn't make it this far."
"You are worthy of rest, even when the world makes you feel you must earn it."
"Tomorrow is another chance for something lovely to happen, even if today wasn't what you hoped."
"May you be loved in all the quiet ways you've always dreamed of."
"Someone will one day adore the little things about you that you've never thought to notice."
"Your kindness has travelled further than you know, touching lives you'll never fully see."
"The love you give to the world is never wasted, even when it doesn't return the way you expected."
"One day, someone will look at you and wonder how they ever lived without knowing you."
"You do not need to become someone else to deserve a love that stays."
"Some of the most beautiful connections begin on the most ordinary days."
"You are someone's favourite memory, even if they've never told you."
"May you always find people who make being yourself feel like the easiest thing in the world."
"Tonight, the moon carries a little wish for you: may your heart feel lighter soon."
"The stars don't hurry to shine. You don't need to rush your becoming."
"Even when clouds hide the moon, its light remains. Yours does, too."
"The moon has watched a thousand beginnings. It believes there's a beautiful one waiting for you."
"Let tonight be a reminder that endings can be gentle, and beginnings can be beautiful."
"The same moon that watches over you has watched over every dream you've ever dared to dream."
"May you find peace in knowing that you are exactly where this chapter of your life begins."
"Under this little moon, I hope you remember that you are loved, and that better days are possible."
];

let lastFortuneIndex = -1;

function revealMoonFortune() {
  let index;

  do {
    index = Math.floor(Math.random() * moonFortunes.length);
  } while (
    moonFortunes.length > 1 &&
    index === lastFortuneIndex
  );

  lastFortuneIndex = index;

  $("moon-note").textContent = moonFortunes[index];

  const card = $("fortune-card");

  // Restart the reveal animation each time the Moon is tapped.
  card.classList.remove("fortune-revealed");
  void card.offsetWidth;
  card.classList.add("fortune-revealed");
}

moonButton.addEventListener("click", revealMoonFortune);

// --------------------------------------------------
// 6. UPDATE THE APP
// --------------------------------------------------

function updateApp() {
  const now = new Date();

  const observer = new Astronomy.Observer(
    location.latitude,
    location.longitude,
    location.elevation
  );

  const phase = getMoonPhase(now);

  $("location-name").textContent = location.name;
  
$("local-time").textContent = new Intl.DateTimeFormat([], {
  hour: "numeric",
  minute: "2-digit",
  timeZone: location.timeZone || "UTC",
}).format(now);

$("moon-date").textContent = new Intl.DateTimeFormat([], {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: location.timeZone || "UTC",
}).format(now);

  $("moon-phase").textContent = phase.name;

  $("moon-illumination").textContent =
    `${phase.illumination}% illuminated`;

  // Update the day/night theme independently of moon drawing.
try {
  const sunAltitude = getSunAltitude(now, observer);
  updateTheme(sunAltitude);
} catch (error) {
  console.error("Could not update the sky theme:", error);
}

// Draw the moon even if the theme calculation fails.
try {
  drawMoon(phase.angle);
} catch (error) {
  console.error("Could not draw the moon:", error);
}

  $("coordinates").textContent =
    `${location.latitude.toFixed(3)}°, ${location.longitude.toFixed(3)}°`;
}

// --------------------------------------------------
// 7. USE CURRENT LOCATION
// --------------------------------------------------

$("locate-button").addEventListener("click", () => {
  if (!navigator.geolocation) {
    message.textContent =
      "Location access is not supported by this browser.";
    return;
  }

  message.textContent = "Requesting your location…";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      location = {
        name: "Your current location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        elevation: position.coords.altitude || 0,
      };

      message.textContent = "Your location has been updated.";
      updateApp();
    },
    () => {
      message.textContent =
        "Couldn't access your location. You can search for a city instead.";
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
});

// --------------------------------------------------
// 8. SEARCH FOR A CITY
// --------------------------------------------------

$("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = $("location-search").value.trim();

  if (query.length < 2) {
    message.textContent = "Enter a city or place to search.";
    return;
  }

  message.textContent = "Searching for your place…";

  try {
    const url = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );

    url.search = new URLSearchParams({
      name: query,
      count: "5",
      language: "en",
      format: "json",
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Location search failed.");
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) {
      message.textContent =
        "No matching places found. Try another search.";
      return;
    }

    
location = {
  name: [
    result.name,
    result.admin1,
    result.country,
  ]
    .filter(Boolean)
    .filter(
      (value, index, values) =>
        values.indexOf(value) === index
    )
    .join(", "),
  latitude: result.latitude,
  longitude: result.longitude,
  elevation: result.elevation || 0,
  timeZone: result.timezone || "UTC",
};

    message.textContent = "Showing your selected location.";
    updateApp();
  } catch (error) {
    console.error(error);

    message.textContent =
      "Couldn't search for that place. Check your connection and try again.";
  }
});

// --------------------------------------------------
// 9. KEEP THE MOON UP TO DATE
// --------------------------------------------------

let lastWidth = window.innerWidth;

window.addEventListener("resize", () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    drawMoon(Astronomy.MoonPhase(new Date()));
  }
  requestAnimationFrame(() => {
  updateApp();
});
});

updateApp();
setInterval(updateApp, 60_000);
