import * as Astronomy from "astronomy-engine";
import "./style.css";

// The 12 tropical zodiac signs, starting at 0° Aries.

const zodiacSigns = [
  {
    name: "Aries",
    symbol: "♈",
    description: "A season of courage, new beginnings, and finding the spark within you."
  },
  {
    name: "Taurus",
    symbol: "♉",
    description: "A gentle invitation to slow down and appreciate life's little comforts."
  },
  {
    name: "Gemini",
    symbol: "♊",
    description: "A time for curiosity, connection, and discovering new possibilities."
  },
  {
    name: "Cancer",
    symbol: "♋",
    description: "A reminder to nurture your heart and find comfort in the places you call home."
  },
  {
    name: "Leo",
    symbol: "♌",
    description: "A season to embrace your light and celebrate the beautiful things that make you unique."
  },
  {
    name: "Virgo",
    symbol: "♍",
    description: "An invitation to find beauty in the details and be gentle with yourself."
  },
  {
    name: "Libra",
    symbol: "♎",
    description: "A season of balance, meaningful connections, and finding peace in the everyday."
  },
  {
    name: "Scorpio",
    symbol: "♏",
    description: "A time for transformation, reflection, and trusting the quiet strength within you."
  },
  {
    name: "Sagittarius",
    symbol: "♐",
    description: "A reminder that wonderful adventures and unexpected possibilities still await."
  },
  {
    name: "Capricorn",
    symbol: "♑",
    description: "A season of patience, perseverance, and believing in the future you're creating."
  },
  {
    name: "Aquarius",
    symbol: "♒",
    description: "An invitation to dream freely and embrace the things that make you different."
  },
  {
    name: "Pisces",
    symbol: "♓",
    description: "A time for imagination, compassion, and listening to the whispers of your heart."
  }
];
// Stylised constellation patterns.
// Each pair represents a star's x and y position.

const zodiacLink = document.querySelector(".zodiac-star-button");

if (zodiacLink) {
  zodiacLink.href = `./zodiac.html${window.location.search}`;
}

function displayConstellation(signName, elementId = "constellation-art") {
  const constellation = document.getElementById(elementId);

  if (!constellation) return;

  const filename = `${signName.toLowerCase()}.svg`;

  const imageURL = new URL(
  `${import.meta.env.BASE_URL}constellations/${filename}`,
  document.baseURI
).href;

  // Share the SVG URL with the CSS layers.
  constellation.style.setProperty(
    "--constellation-mask",
    `url("${imageURL}")`
  );

  constellation.setAttribute(
    "aria-label",
    `${signName} constellation`
  );
}

// Convert an ecliptic longitude into a zodiac sign.

function getZodiacSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;

  const index = Math.floor(normalized / 30);

  return zodiacSigns[index];
}

function updateZodiacTheme() {
  const now = new Date();

  // Temporary location: Melbourne.
  // We'll connect this to the homepage's selected city later.
  const observer = new Astronomy.Observer(
    -37.8136,
    144.9631,
    0
  );

  // Calculate the Sun's position in the sky.
  function getSunAltitude(date) {
    const equator = Astronomy.Equator(
      "Sun",
      date,
      observer,
      true,
      true
    );

    const horizon = Astronomy.Horizon(
      date,
      observer,
      equator.ra,
      equator.dec,
      "normal"
    );

    return horizon.altitude;
  }

  const altitude = getSunAltitude(now);

  // Compare against 10 minutes later to determine
  // whether the Sun is rising or setting.
  const tenMinutesLater = new Date(
    now.getTime() + 10 * 60 * 1000
  );

  const nextAltitude = getSunAltitude(tenMinutesLater);

  const isRising = nextAltitude > altitude;

  let theme;

  if (altitude > 6) {
    theme = "day";
  } else if (altitude > -6) {
    theme = isRising ? "dawn" : "dusk";
  } else {
    theme = "night";
  }

  document.body.dataset.theme = theme;

  // Match the browser's theme colour to the page.
  const themeColours = {
    dawn: "#f4d9ca",
    day: "#f4ece3",
    dusk: "#ead4d7",
    night: "#17182d"
  };

  const themeMeta = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (themeMeta) {
    themeMeta.setAttribute(
      "content",
      themeColours[theme]
    );
  }
}

function createZodiacStarfield() {
  const starfield = document.getElementById("zodiac-starfield");

  if (!starfield) return;

  // Clear existing stars to avoid duplicates.
  starfield.replaceChildren();

  // Match the starfield height to the entire page.

  const pageHeight = Math.max(
  document.documentElement.scrollHeight,
  document.body.scrollHeight
);

function resizeZodiacStarfield() {
  const starfield = document.getElementById("zodiac-starfield");

  if (!starfield) return;

  const pageHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );

  starfield.style.height = `${pageHeight}px`;
}

starfield.style.height = `${pageHeight}px`;

  const numberOfStars = 130;

  // A fixed seed keeps the arrangement consistent
  // instead of changing every time the page reloads.
  let seed = 1847;

  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement("span");

    star.className = "zodiac-sky-star";

    const x = random() * 100;
    const y = random() * 100;

    const size = 2 + random() * 3;
    const duration = 3 + random() * 5;
    const delay = -(random() * duration);

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    star.style.setProperty(
      "--star-size",
      `${size}px`
    );

    star.style.setProperty(
      "--star-duration",
      `${duration}s`
    );

    star.style.setProperty(
      "--star-delay",
      `${delay}s`
    );

    starfield.appendChild(star);
  }
}

// Update the current zodiac information.

function updateZodiac() {
  const now = new Date();

  // Get the Sun's position.
  const sunLongitude = Astronomy.SunPosition(now).elon;

  // Get the Moon's position.
  const moonLongitude = Astronomy.EclipticGeoMoon(now).lon;

  // Determine their zodiac signs.
  const sunSign = getZodiacSign(sunLongitude);
  const moonSign = getZodiacSign(moonLongitude);

  // Large constellation: current zodiac season
  displayConstellation(sunSign.name);
  
  // Small constellation: current Moon sign
  displayConstellation(moonSign.name, "moon-constellation");

  // Update the Sun card.
  document.getElementById("sun-sign").textContent =
    `${sunSign.name} Season`;

  document.getElementById("sun-description").textContent =
    sunSign.description;

  document.getElementById("moon-sign").textContent =
    `Moon in ${moonSign.name}`;

  document.getElementById("moon-description").textContent =
    moonSign.description;
}

// Calculate immediately.
updateZodiac();

// Refresh once a minute.
setInterval(updateZodiac, 60 * 1000);

// Set the initial sky theme.
updateZodiacTheme();

// Update the sky theme every minute.
setInterval(updateZodiacTheme, 60 * 1000);

createZodiacStarfield();
window.addEventListener("resize", resizeZodiacStarfield);
window.addEventListener("load", resizeZodiacStarfield);