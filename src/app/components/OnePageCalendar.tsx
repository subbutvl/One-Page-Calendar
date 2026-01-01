import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useSpring,
} from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  RotateCw,
  RefreshCcw,
  Compass,
  Moon,
  Sun,
} from "lucide-react";
import {
  WiMoonNew,
  WiMoonWaxingCrescent1,
  WiMoonFirstQuarter,
  WiMoonWaxingGibbous1,
  WiMoonFull,
  WiMoonWaningGibbous1,
  WiMoonThirdQuarter,
  WiMoonWaningCrescent1,
} from "react-icons/wi";
import {
  format,
  getDaysInMonth,
  getDayOfYear,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  addYears,
  subYears,
  getISOWeek,
} from "date-fns";
import { cn } from "./ui/utils";

// --- Constants & Types ---

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Asia/Kolkata",
];

const SEASONS = [
  {
    name: "Winter",
    startMonth: 11,
    startDay: 21,
    color: "#A5F3FC",
  }, // Cyan-200
  {
    name: "Spring",
    startMonth: 2,
    startDay: 20,
    color: "#F9A8D4",
  }, // Pink-300
  {
    name: "Summer",
    startMonth: 5,
    startDay: 21,
    color: "#FDE047",
  }, // Yellow-300
  {
    name: "Autumn",
    startMonth: 8,
    startDay: 22,
    color: "#FB923C",
  }, // Orange-400
  {
    name: "Monsoon",
    startMonth: 5,
    startDay: 15,
    color: "#60A5FA",
  }, // Blue-400
];

const SEASONS_DARK = [
  {
    name: "Winter",
    startMonth: 11,
    startDay: 21,
    color: "#164e63",
  }, // Cyan-900
  {
    name: "Spring",
    startMonth: 2,
    startDay: 20,
    color: "#831843",
  }, // Pink-900
  {
    name: "Summer",
    startMonth: 5,
    startDay: 21,
    color: "#713f12",
  }, // Yellow-900
  {
    name: "Autumn",
    startMonth: 8,
    startDay: 22,
    color: "#7c2d12",
  }, // Orange-900
  {
    name: "Monsoon",
    startMonth: 5,
    startDay: 15,
    color: "#1e3a8a",
  }, // Blue-900
];

const ZODIAC_SIGNS = [
  {
    name: "Capricorn",
    startMonth: 11,
    startDay: 22,
    symbol: "♑︎",
    element: "Earth",
    color: "#A7F3D0",
  }, // Green
  {
    name: "Aquarius",
    startMonth: 0,
    startDay: 20,
    symbol: "♒︎",
    element: "Air",
    color: "#BAE6FD",
  }, // Blue
  {
    name: "Pisces",
    startMonth: 1,
    startDay: 19,
    symbol: "♓︎",
    element: "Water",
    color: "#DDD6FE",
  }, // Purple
  {
    name: "Aries",
    startMonth: 2,
    startDay: 21,
    symbol: "♈︎",
    element: "Fire",
    color: "#FECACA",
  }, // Red
  {
    name: "Taurus",
    startMonth: 3,
    startDay: 20,
    symbol: "♉︎",
    element: "Earth",
    color: "#6EE7B7",
  }, // Green
  {
    name: "Gemini",
    startMonth: 4,
    startDay: 21,
    symbol: "♊︎",
    element: "Air",
    color: "#7DD3FC",
  }, // Blue
  {
    name: "Cancer",
    startMonth: 5,
    startDay: 21,
    symbol: "♋︎",
    element: "Water",
    color: "#C4B5FD",
  }, // Purple
  {
    name: "Leo",
    startMonth: 6,
    startDay: 23,
    symbol: "♌︎",
    element: "Fire",
    color: "#FCA5A5",
  }, // Red
  {
    name: "Virgo",
    startMonth: 7,
    startDay: 23,
    symbol: "♍︎",
    element: "Earth",
    color: "#34D399",
  }, // Green
  {
    name: "Libra",
    startMonth: 8,
    startDay: 23,
    symbol: "♎︎︎",
    element: "Air",
    color: "#38BDF8",
  }, // Blue
  {
    name: "Scorpio",
    startMonth: 9,
    startDay: 23,
    symbol: "♏︎",
    element: "Water",
    color: "#A78BFA",
  }, // Purple
  {
    name: "Sagittarius",
    startMonth: 10,
    startDay: 22,
    symbol: "♐︎",
    element: "Fire",
    color: "#F87171",
  }, // Red
];

const MONTH_COLORS = [
  "#E0F2FE", // Jan
  "#F3E8FF", // Feb
  "#ECFCCB", // Mar
  "#FCE7F3", // Apr
  "#DCFCE7", // May
  "#FEF9C3", // Jun
  "#FEE2E2", // Jul
  "#FEF3C7", // Aug
  "#DBEAFE", // Sep
  "#FAE8FF", // Oct
  "#FFEDD5", // Nov
  "#CCFBF1", // Dec
];

const MONTH_COLORS_DARK = [
  "#0c4a6e", // Jan: Sky-900
  "#581c87", // Feb: Purple-900
  "#365314", // Mar: Lime-900
  "#831843", // Apr: Pink-900
  "#14532d", // May: Green-900
  "#713f12", // Jun: Yellow-900
  "#7f1d1d", // Jul: Red-900
  "#78350f", // Aug: Amber-900
  "#1e3a8a", // Sep: Blue-900
  "#701a75", // Oct: Fuchsia-900
  "#7c2d12", // Nov: Orange-900
  "#134e4a", // Dec: Teal-900
];

const MOON_PHASE_REF = new Date("2000-01-06T12:24:01"); // New Moon
const SYNODIC_MONTH = 29.530588853;

// --- Helper Functions ---

function getMoonPhase(date: Date) {
  const diffTime = date.getTime() - MOON_PHASE_REF.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const phase = (diffDays % SYNODIC_MONTH) / SYNODIC_MONTH; // 0..1
  return phase < 0 ? phase + 1 : phase;
}

const MoonIcon = ({
  phase,
  size = 16,
  color = "currentColor",
}: {
  phase: number;
  size?: number;
  color?: string;
}) => {
  // New Moon: Dark grey to resemble shadow (visible on both backgrounds)
  if (phase < 0.03 || phase > 0.97)
    return <WiMoonNew size={size} color="#64748b" />;

  // Waxing Crescent
  if (phase < 0.22)
    return <WiMoonWaxingCrescent1 size={size} color={color} />;

  // First Quarter
  if (phase < 0.28)
    return <WiMoonFirstQuarter size={size} color={color} />;

  // Waxing Gibbous
  if (phase < 0.47)
    return <WiMoonWaxingGibbous1 size={size} color={color} />;

  // Full Moon: Gold/Amber
  if (phase < 0.53)
    return <WiMoonFull size={size} color="#fbbf24" />;

  // Waning Gibbous
  if (phase < 0.72)
    return <WiMoonWaningGibbous1 size={size} color={color} />;

  // Last Quarter (Third Quarter in WI)
  if (phase < 0.78)
    return <WiMoonThirdQuarter size={size} color={color} />;

  // Waning Crescent
  return <WiMoonWaningCrescent1 size={size} color={color} />;
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians =
    ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function createSectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
) {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);

  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`, // Outer arc (Clockwise)
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`, // Inner arc (Counter-Clockwise)
    `Z`,
  ].join(" ");
}

// --- Components ---

export function OnePageCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isDark = theme === "dark";

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Viewport State for Zooming
  const svgRef = useRef<SVGSVGElement>(null);
  // Canvas size increased to 1600x1600 to accommodate larger spacing
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    w: 1600,
    h: 1600,
  });
  const viewX = useMotionValue(0);
  const viewY = useMotionValue(0);
  const viewW = useMotionValue(1600);
  const viewH = useMotionValue(1600);

  // Rotation State
  const rotation = useMotionValue(0);
  const isDragging = useRef(false);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(0);

  // Update viewbox string from motion values
  const viewBoxString = useTransform(
    [viewX, viewY, viewW, viewH],
    ([x, y, w, h]) => `${x} ${y} ${w} ${h}`,
  );

  // Time ticker
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date()),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // Constants for layout
  const CX = 800;
  const CY = 800;

  // Radius definitions (Modified for Stacked Disc Effect with Larger Spacing)
  // Layer 1 (Bottom): Days
  const R_DAYS_DISC = 800; // Expanded to fit 3-letter days
  const R_DAYS_OUTER = 740;
  const R_DAYS_INNER = 720;

  // Layer 2: Weeks (New)
  const R_WEEKS_DISC = 720;
  const R_WEEKS_TEXT = 690;

  // Layer 3: Months
  const R_MONTHS_DISC = 660;
  const R_MONTHS_TEXT = 620;

  // Layer 4: Zodiac
  const R_ZODIAC_DISC = 570;
  const R_ZODIAC_TEXT = 530;

  // Layer 5: Seasons
  const R_SEASONS_DISC = 470;
  const R_SEASONS_TEXT = 420;

  // Layer 6 (Top): Center
  const R_CENTER_DISC = 340;

  // --- Interaction Handlers ---

  const getPointerAngle = (
    e: React.PointerEvent | PointerEvent,
  ) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculate angle in degrees
    const radians = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX,
    );
    return radians * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow left click
    if (e.button !== 0) return;
    isDragging.current = true;
    startAngleRef.current = getPointerAngle(e);
    startRotationRef.current = rotation.get();

    // Capture pointer to handle moves outside SVG
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const currentAngle = getPointerAngle(e);
    const delta = currentAngle - startAngleRef.current;
    rotation.set(startRotationRef.current + delta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // --- Data Generation ---

  const calendarData = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);
    const days = eachDayOfInterval({ start, end });
    const totalDays = days.length;

    return days.map((date, index) => {
      // Angle goes from 0 to 360
      const startAngle = (index / totalDays) * 360;
      const endAngle = ((index + 1) / totalDays) * 360;
      const midAngle = (startAngle + endAngle) / 2;

      return {
        date,
        dayOfYear: index + 1,
        month: date.getMonth(),
        dayOfMonth: date.getDate(),
        startAngle,
        endAngle,
        midAngle,
        moonPhase: getMoonPhase(date),
        isToday:
          isSameDay(date, new Date()) &&
          year === new Date().getFullYear(),
      };
    });
  }, [year]);

  // Weeks Data Generation
  const weeksData = useMemo(() => {
    const data = [];
    let currentWeek = -1;
    let startAngle = 0;
    let startDate = calendarData[0].date;

    calendarData.forEach((day, i) => {
      const weekNum = getISOWeek(day.date);

      // Check for week change or first iteration
      if (weekNum !== currentWeek && currentWeek !== -1) {
        // Close previous week
        const endAngle = day.startAngle; // End at start of current day
        const midAngle = (startAngle + endAngle) / 2;

        data.push({
          weekNum: currentWeek,
          startAngle,
          endAngle,
          midAngle,
          label: `W${currentWeek.toString().padStart(2, "0")}`,
          color: isDark
            ? `hsl(${(currentWeek * 12) % 360}, 60%, 20%)` // Dark mode: darker, less saturated
            : `hsl(${(currentWeek * 12) % 360}, 70%, 94%)`, // Light mode: pastel
        });

        startAngle = day.startAngle;
        startDate = day.date;
      }

      if (currentWeek === -1) {
        currentWeek = weekNum;
        startAngle = day.startAngle;
      }

      currentWeek = weekNum;

      // Handle last day
      if (i === calendarData.length - 1) {
        data.push({
          weekNum: currentWeek,
          startAngle,
          endAngle: 360,
          midAngle: (startAngle + 360) / 2,
          label: `W${currentWeek.toString().padStart(2, "0")}`,
          color: isDark
            ? `hsl(${(currentWeek * 12) % 360}, 60%, 20%)`
            : `hsl(${(currentWeek * 12) % 360}, 70%, 94%)`,
        });
      }
    });

    return data;
  }, [calendarData, isDark]);

  // Seasons Arcs
  const seasonsData = useMemo(() => {
    const palette = isDark ? SEASONS_DARK : SEASONS;

    // Helper to find color by name
    const getColor = (name: string) =>
      palette.find((s) => s.name === name)?.color || "#000000";

    let config = [];
    let baseSeasonName = "Winter"; // Season at start of year

    if (timezone === "Asia/Kolkata") {
      // India: Summer (Mar-Jun), Monsoon (Jun-Oct), Autumn (Oct-Dec), Winter (Dec-Mar)
      config = [
        { name: "Summer", month: 2, day: 1 }, // Mar 1
        { name: "Monsoon", month: 5, day: 15 }, // Jun 15
        { name: "Autumn", month: 9, day: 1 }, // Oct 1
        { name: "Winter", month: 11, day: 1 }, // Dec 1
      ];
      baseSeasonName = "Winter";
    } else if (
      timezone === "Australia/Sydney" ||
      timezone === "Pacific/Auckland"
    ) {
      // Southern Hemisphere
      config = [
        { name: "Autumn", month: 2, day: 20 }, // Mar 20
        { name: "Winter", month: 5, day: 21 }, // Jun 21
        { name: "Spring", month: 8, day: 22 }, // Sep 22
        { name: "Summer", month: 11, day: 21 }, // Dec 21
      ];
      baseSeasonName = "Summer";
    } else {
      // Northern Hemisphere (Default)
      config = [
        { name: "Spring", month: 2, day: 20 }, // Mar 20
        { name: "Summer", month: 5, day: 21 }, // Jun 21
        { name: "Autumn", month: 8, day: 22 }, // Sep 22
        { name: "Winter", month: 11, day: 21 }, // Dec 21
      ];
      baseSeasonName = "Winter";
    }

    // Map config to transition dates
    const transitions = config.map((c) => ({
      date: new Date(year, c.month, c.day),
      name: c.name,
      // Color will be calculated based on angle
    }));

    const totalDays = calendarData.length;
    const getAngle = (date: Date) =>
      ((getDayOfYear(date) - 1) / totalDays) * 360;

    const getColorForAngle = (angle: number) => {
      return isDark
        ? `hsl(${angle % 360}, 60%, 20%)`
        : `hsl(${angle % 360}, 70%, 94%)`;
    };

    const arcs = [];

    // Helper to add arcs with correct colors
    const addArc = (
      name: string,
      startAngle: number,
      endAngle: number,
      isSplit = false,
    ) => {
      // Calculate midpoint angle for color
      let midAngle;
      if (endAngle < startAngle) {
        midAngle = (startAngle + endAngle + 360) / 2;
      } else {
        midAngle = (startAngle + endAngle) / 2;
      }

      return {
        name,
        startAngle,
        endAngle,
        color: getColorForAngle(midAngle),
        isSplit,
      };
    };

    // Segment 1: Start of Year -> First Transition
    arcs.push(
      addArc(
        baseSeasonName,
        0,
        getAngle(transitions[0].date),
        true,
      ),
    );

    // Segments 2, 3, 4: Between Transitions
    for (let i = 0; i < transitions.length - 1; i++) {
      arcs.push(
        addArc(
          transitions[i].name,
          getAngle(transitions[i].date),
          getAngle(transitions[i + 1].date),
        ),
      );
    }

    // Segment 5: Last Transition -> End of Year
    const lastT = transitions[transitions.length - 1];
    arcs.push(
      addArc(lastT.name, getAngle(lastT.date), 360, true),
    );

    return arcs;
  }, [year, calendarData.length, isDark, timezone]);

  // Unique Season Labels (for single rendering)
  const seasonLabels = useMemo(() => {
    // Calculate mid-angles for labels.
    const getAngle = (m: number, d: number) => {
      const date = new Date(year, m, d);
      return (
        ((getDayOfYear(date) - 1) / calendarData.length) * 360
      );
    };

    // Helper to get text color matching the background hue but with contrast
    const getTextColor = (angle: number) => {
      return isDark
        ? `hsl(${angle % 360}, 90%, 80%)` // Light text for dark mode
        : `hsl(${angle % 360}, 90%, 30%)`; // Dark text for light mode
    };

    if (timezone === "Asia/Kolkata") {
      const winterAngle = getAngle(0, 15);
      const summerAngle = getAngle(3, 15);
      const monsoonAngle = getAngle(7, 1);
      const autumnAngle = getAngle(10, 1);
      return [
        {
          name: "Winter",
          angle: winterAngle,
          color: getTextColor(winterAngle),
        },
        {
          name: "Summer",
          angle: summerAngle,
          color: getTextColor(summerAngle),
        },
        {
          name: "Monsoon",
          angle: monsoonAngle,
          color: getTextColor(monsoonAngle),
        },
        {
          name: "Autumn",
          angle: autumnAngle,
          color: getTextColor(autumnAngle),
        },
      ];
    } else if (
      timezone === "Australia/Sydney" ||
      timezone === "Pacific/Auckland"
    ) {
      const summerAngle = getAngle(0, 15);
      const autumnAngle = getAngle(3, 15);
      const winterAngle = getAngle(6, 15);
      const springAngle = getAngle(10, 1);
      return [
        {
          name: "Summer",
          angle: summerAngle,
          color: getTextColor(summerAngle),
        },
        {
          name: "Autumn",
          angle: autumnAngle,
          color: getTextColor(autumnAngle),
        },
        {
          name: "Winter",
          angle: winterAngle,
          color: getTextColor(winterAngle),
        },
        {
          name: "Spring",
          angle: springAngle,
          color: getTextColor(springAngle),
        },
      ];
    } else {
      const winterAngle = getAngle(1, 4);
      const springAngle = getAngle(4, 5);
      const summerAngle = getAngle(7, 6);
      const autumnAngle = getAngle(10, 6);
      return [
        {
          name: "Winter",
          angle: winterAngle,
          color: getTextColor(winterAngle),
        },
        {
          name: "Spring",
          angle: springAngle,
          color: getTextColor(springAngle),
        },
        {
          name: "Summer",
          angle: summerAngle,
          color: getTextColor(summerAngle),
        },
        {
          name: "Autumn",
          angle: autumnAngle,
          color: getTextColor(autumnAngle),
        },
      ];
    }
  }, [year, calendarData.length, isDark, timezone]);

  // Months Arcs (Updated for Disc Layout)
  const monthsData = useMemo(() => {
    const data = [];
    let currentAngle = 0;
    const totalDays = calendarData.length;

    for (let m = 0; m < 12; m++) {
      const daysInM = getDaysInMonth(new Date(year, m));
      const sweep = (daysInM / totalDays) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;
      const midAngle = startAngle + sweep / 2;

      // HSL Color Generation (Full Spectrum)
      const color = isDark
        ? `hsl(${(m * 30) % 360}, 60%, 20%)`
        : `hsl(${(m * 30) % 360}, 70%, 94%)`;

      data.push({
        index: m,
        name: format(new Date(year, m), "MMMM"),
        startAngle,
        endAngle,
        midAngle,
        color,
      });
      currentAngle += sweep;
    }
    return data;
  }, [year, calendarData.length, isDark]);

  // Zodiac Arcs (Updated for Disc Layout and Colors)
  const zodiacData = useMemo(() => {
    const totalDays = calendarData.length;
    const getAngle = (m: number, d: number) => {
      const date = new Date(year, m, d);
      return ((getDayOfYear(date) - 1) / totalDays) * 360;
    };

    // Calculate raw start/end angles for each sign
    const signs = ZODIAC_SIGNS.map((z, i) => {
      // HSL Color Generation (Full Spectrum aligned with index)
      // Note: Zodiac signs are roughly 30 degrees each
      const color = isDark
        ? `hsl(${(i * 30) % 360}, 60%, 20%)`
        : `hsl(${(i * 30) % 360}, 70%, 94%)`;

      return {
        ...z,
        color,
        angle: getAngle(z.startMonth, z.startDay),
      };
    }).sort((a, b) => a.angle - b.angle);

    const arcs = [];
    const labels = [];

    for (let i = 0; i < signs.length; i++) {
      const current = signs[i];
      const next = signs[(i + 1) % signs.length];

      let start = current.angle;
      let end = next.angle;

      // Handle Label Position (Midpoint calculation logic)
      let mid;
      if (end < start) {
        // Wrap case (e.g., Capricorn start 350, end 20)
        const totalSweep = 360 - start + end;
        let midVal = start + totalSweep / 2;
        if (midVal >= 360) midVal -= 360;
        mid = midVal;
      } else {
        mid = (start + end) / 2;
      }

      labels.push({
        ...current,
        midAngle: mid,
      });

      // Handle Arc Splitting for visual rendering
      if (end < start) end += 360;

      if (end > 360) {
        // Split into two arcs
        arcs.push({
          ...current,
          startAngle: start,
          endAngle: 360,
        });
        arcs.push({
          ...current,
          startAngle: 0,
          endAngle: end - 360,
        });
      } else {
        arcs.push({
          ...current,
          startAngle: start,
          endAngle: end,
        });
      }
    }

    return { arcs, labels };
  }, [year, calendarData.length, isDark]);

  // --- Zoom/Pan Actions ---

  const animateView = (
    targetX: number,
    targetY: number,
    targetW: number,
    targetH: number,
  ) => {
    animate(viewX, targetX, {
      duration: 0.8,
      ease: "easeInOut",
    });
    animate(viewY, targetY, {
      duration: 0.8,
      ease: "easeInOut",
    });
    animate(viewW, targetW, {
      duration: 0.8,
      ease: "easeInOut",
    });
    animate(viewH, targetH, {
      duration: 0.8,
      ease: "easeInOut",
    });
  };

  const resetZoom = () => animateView(0, 0, 1600, 1600);

  const zoomToAngle = (angle: number, zoomLevel: number) => {
    // Calculate center point of the target area on the Days ring
    const r = R_DAYS_INNER;

    // Adjust angle by current rotation to find Visual Position
    const visualAngle = angle + rotation.get();

    // polarToCartesian uses center 800,800
    const p = polarToCartesian(CX, CY, r, visualAngle);

    // Viewport size
    const w = 1600 / zoomLevel;
    const h = 1600 / zoomLevel;

    // Top-left corner of viewBox
    const x = p.x - w / 2;
    const y = p.y - h / 2;

    animateView(x, y, w, h);
  };

  const handleZoomToToday = () => {
    const today = new Date();
    if (today.getFullYear() !== year)
      setYear(today.getFullYear());
    // Find today's angle
    const dayIdx = getDayOfYear(today) - 1;
    const angle = (dayIdx / calendarData.length) * 360;
    zoomToAngle(angle, 4); // 4x zoom
  };

  const handleZoomToMonth = () => {
    const today = new Date();
    // Center on the middle of the current month
    const m = today.getMonth();
    const monthInfo = monthsData[m];
    zoomToAngle(monthInfo.midAngle, 2.5);
  };

  const handleZoomToWeek = () => {
    const today = new Date();
    const weekNum = getISOWeek(today);
    const weekInfo = weeksData.find(
      (w) => w.weekNum === weekNum,
    );
    if (weekInfo) {
      zoomToAngle(weekInfo.midAngle, 6);
    }
  };

  // --- Render Helpers ---

  // Text along path logic
  const renderTextArc = (
    text: string,
    radius: number,
    startAngle: number,
    endAngle: number,
    fontSize: number,
    bold = false,
  ) => {
    // To center text, we need the path to span the arc, then use text-anchor="middle" startOffset="50%"
    // Ensure angles are correct. SVG arc path direction is important.
    // describeArc goes clockwise (end -> start in my helper? check helper)
    // My helper: start is endAngle, end is startAngle. Large arc flag logic...
    // Let's rely on a simpler path for text: describeArc is standard cartesian.
    // For text, we usually want it readable.

    const mid = (startAngle + endAngle) / 2;
    // If text is at the bottom (90 to 270 degrees), we might want to flip it?
    // Circular calendars usually keep text upright or radial.
    // The reference image has Month names radial or along arc?
    // Reference: Month names are along the arc. "January", "February" etc.
    // They are upright at top, upside down at bottom?
    // Reference image has all text readable from center outward or top-oriented.
    // Let's stick to simple arc text first.

    const pathId = `path-${text}-${radius}-${startAngle.toFixed(2)}`;
    // If arc is inverted (bottom half), we might want to reverse path direction so text isn't upside down?
    // But then it reads left-to-right on the bottom arc?
    // Let's just render standard and see.

    return (
      <g key={pathId}>
        <path
          id={pathId}
          d={describeArc(CX, CY, radius, startAngle, endAngle)}
          fill="none"
          stroke="none"
        />
        <text
          className={cn(
            "fill-current text-gray-800 dark:text-gray-200",
            bold && "font-bold",
          )}
          fontSize={fontSize}
          dy={fontSize / 3}
        >
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
          >
            {text}
          </textPath>
        </text>
      </g>
    );
  };

  const getClockTime = (date: Date, tz: string) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
      timeZone: tz,
    }).formatToParts(date);
    const h = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
      10,
    );
    const m = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
      10,
    );
    const s = parseInt(
      parts.find((p) => p.type === "second")?.value || "0",
      10,
    );
    return { h, m, s };
  };

  const { h, m, s } = getClockTime(currentTime, timezone);

  // 12-hour clock angles
  // Top (0 deg) = 12:00
  const hourAngle = ((h % 12) + m / 60) * 30; // 30 degrees per hour
  const minuteAngle = m * 6; // 6 degrees per minute
  const secondAngle = s * 6;

  // Determine Day/Night for clock face background
  // Simple check: 6 AM to 6 PM is Day
  const isDayTime = h >= 6 && h < 18;

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-slate-950 flex flex-col relative overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm p-2 rounded-xl border border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-2xl font-bold font-mono tracking-tighter">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm p-2 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>

            {/* Current Date (Timezone Aware) */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: timezone,
              }).format(currentTime)}
            </div>
          </div>

          {/* World Time */}
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm p-2 rounded-xl border border-gray-200 dark:border-slate-800">
            <Clock
              size={16}
              className="text-gray-500 dark:text-gray-400"
            />
            <select
              className="bg-transparent text-sm font-medium outline-none cursor-pointer max-w-[150px] dark:bg-slate-900"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ").split("/").pop()}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-gray-300 dark:bg-slate-700 mx-1"></div>
            <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
              {currentTime.toLocaleTimeString("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
        <motion.svg
          ref={svgRef}
          className="w-full h-full block touch-none select-none"
          viewBox={viewBoxString}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Drop Shadow for Stacked Discs */}
            <filter
              id="disc-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="4"
                result="blur"
              />
              <feOffset
                in="blur"
                dx="0"
                dy="2"
                result="offsetBlur"
              />
              <feFlood
                floodColor="black"
                floodOpacity="0.15"
                result="flood"
              />
              <feComposite
                in="flood"
                in2="offsetBlur"
                operator="in"
                result="shadow"
              />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {SEASONS.map((season) => (
              <radialGradient
                key={`grad-${season.name}`}
                id={`grad-${season.name}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
              >
                <stop
                  offset="0%"
                  stopColor="white"
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={season.color}
                  stopOpacity="0.8"
                />
              </radialGradient>
            ))}

            {/* Zodiac Gradients */}
            {ZODIAC_SIGNS.map((sign) => (
              <radialGradient
                key={`grad-zodiac-${sign.name}`}
                id={`grad-zodiac-${sign.name}`}
                cx="0.5"
                cy="0.5"
                r="0.8"
              >
                <stop
                  offset="60%"
                  stopColor="white"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={sign.color}
                  stopOpacity="0.8"
                />
              </radialGradient>
            ))}

            {/* Clock Face Gradients */}
            <radialGradient
              id="clock-day"
              cx="0.5"
              cy="0.5"
              r="0.8"
            >
              <stop offset="0%" stopColor="#bae6fd" />{" "}
              {/* Sky 200 */}
              <stop offset="100%" stopColor="#38bdf8" />{" "}
              {/* Sky 400 */}
            </radialGradient>
            <radialGradient
              id="clock-night"
              cx="0.5"
              cy="0.5"
              r="0.8"
            >
              <stop offset="0%" stopColor="#4338ca" />{" "}
              {/* Indigo 700 */}
              <stop offset="100%" stopColor="#0f172a" />{" "}
              {/* Slate 900 */}
            </radialGradient>
          </defs>

          {/* Background for whole calendar area */}
          <circle cx={CX} cy={CY} r={800} fill="transparent" />

          {/* Rotatable Group containing ALL RINGS */}
          <motion.g
            style={{
              rotate: rotation,
              transformOrigin: "800px 800px",
            }}
          >
            {/* --- Level 1: Days Ring (Bottom) --- */}
            {/* Base Disc */}
            <circle
              cx={CX}
              cy={CY}
              r={R_DAYS_DISC}
              fill={isDark ? "#0f172a" : "#FDFBF7"}
              stroke={isDark ? "#334155" : "#E5E7EB"}
              strokeWidth="1"
            />

            {/* Days Ticks & Numbers */}
            {calendarData.map((day, i) => {
              const isMonthStart = day.dayOfMonth === 1;

              // Calculate positions for tick marks
              const innerP = polarToCartesian(
                CX,
                CY,
                R_DAYS_INNER,
                day.midAngle,
              );
              const outerP = polarToCartesian(
                CX,
                CY,
                R_DAYS_OUTER,
                day.midAngle,
              );

              // Expanded spacing for "Mon", "Tue" etc.
              const weekdayP = polarToCartesian(
                CX,
                CY,
                R_DAYS_OUTER + 18,
                day.midAngle,
              );
              const textP = polarToCartesian(
                CX,
                CY,
                R_DAYS_OUTER + 38,
                day.midAngle,
              );

              // Moon position (further out)
              const moonP = polarToCartesian(
                CX,
                CY,
                R_DAYS_OUTER + 52,
                day.midAngle,
              );

              // Highlighting
              const isWeekend =
                day.date.getDay() === 0 ||
                day.date.getDay() === 6;
              const baseColor = isWeekend
                ? "#9CA3AF"
                : isDark
                  ? "#E2E8F0"
                  : "#374151"; // Muted for weekends, light text for dark mode
              const tickColor = day.isToday
                ? "red"
                : isWeekend
                  ? "#D1D5DB"
                  : isDark
                    ? "#475569"
                    : "#E5E7EB";
              const textColor = day.isToday ? "red" : baseColor;
              const tickWidth = day.isToday ? 3 : 1;
              const isSpecial = SEASONS.some(
                (s) =>
                  s.startMonth === day.month &&
                  s.startDay === day.dayOfMonth,
              );
              const dayLetter = day.date.toLocaleDateString(
                "en-US",
                { weekday: "short" },
              );

              // Month Separator positions - Prominent separator
              const sepInner = polarToCartesian(
                CX,
                CY,
                R_DAYS_INNER - 10,
                day.startAngle,
              );
              const sepOuter = polarToCartesian(
                CX,
                CY,
                R_DAYS_OUTER + 60,
                day.startAngle,
              );

              return (
                <g key={`day-${i}`}>
                  {/* Month Separator Line (At the start of the 1st day of month) */}
                  {isMonthStart && (
                    <line
                      x1={sepInner.x}
                      y1={sepInner.y}
                      x2={sepOuter.x}
                      y2={sepOuter.y}
                      stroke={isDark ? "#475569" : "#6B7280"}
                      strokeWidth="1"
                      strokeOpacity=".25"
                    />
                  )}

                  <line
                    x1={innerP.x}
                    y1={innerP.y}
                    x2={outerP.x}
                    y2={outerP.y}
                    stroke={tickColor}
                    strokeWidth={tickWidth}
                  />

                  {/* Weekday Letter (M, T, W...) */}
                  <text
                    x={weekdayP.x}
                    y={weekdayP.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${day.midAngle + 90}, ${weekdayP.x}, ${weekdayP.y})`}
                    fontSize="7"
                    fill={textColor}
                    fontWeight="normal"
                    opacity={0.8}
                  >
                    {dayLetter}
                  </text>

                  {/* Date Number (Single Ring) */}
                  <text
                    x={textP.x}
                    y={textP.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${day.midAngle + 90}, ${textP.x}, ${textP.y})`}
                    fontSize="9"
                    fill={textColor}
                    fontWeight={day.isToday ? "bold" : "normal"}
                  >
                    {day.dayOfMonth}
                  </text>

                  {/* Moon Phase Icon */}
                  {(day.moonPhase < 0.03 ||
                    day.moonPhase > 0.97 ||
                    (day.moonPhase > 0.22 &&
                      day.moonPhase < 0.28) ||
                    (day.moonPhase > 0.47 &&
                      day.moonPhase < 0.53) ||
                    (day.moonPhase > 0.72 &&
                      day.moonPhase < 0.78)) && (
                    <g
                      transform={`translate(${moonP.x}, ${moonP.y}) rotate(${day.midAngle + 90}) translate(-6, -6)`}
                    >
                      <MoonIcon
                        phase={day.moonPhase}
                        size={12}
                        color={isDark ? "#F1F5F9" : "#000"}
                      />
                    </g>
                  )}
                  {isSpecial && (
                    <circle
                      cx={outerP.x}
                      cy={outerP.y}
                      r={3}
                      fill={isDark ? "white" : "black"}
                    />
                  )}
                </g>
              );
            })}

            {/* --- Level 1.5: Weeks Ring (New) --- */}
            <g filter="url(#disc-shadow)">
              <circle
                cx={CX}
                cy={CY}
                r={R_WEEKS_DISC}
                fill={isDark ? "#1e293b" : "#FAFAF9"}
                stroke={isDark ? "#334155" : "#E5E7EB"}
                strokeWidth="0.5"
              />
            </g>
            {weeksData.map((week, i) => (
              <g
                key={`week-${i}`}
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomToAngle(week.midAngle, 5);
                }}
              >
                {/* Colored Sector Background */}
                <path
                  d={createSectorPath(
                    CX,
                    CY,
                    R_WEEKS_DISC,
                    R_MONTHS_DISC,
                    week.startAngle,
                    week.endAngle,
                  )}
                  fill={week.color}
                  stroke="none"
                />

                {/* Week Separator */}
                <line
                  x1={
                    polarToCartesian(
                      CX,
                      CY,
                      R_WEEKS_DISC,
                      week.startAngle,
                    ).x
                  }
                  y1={
                    polarToCartesian(
                      CX,
                      CY,
                      R_WEEKS_DISC,
                      week.startAngle,
                    ).y
                  }
                  x2={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC,
                      week.startAngle,
                    ).x
                  }
                  y2={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC,
                      week.startAngle,
                    ).y
                  }
                  stroke="white"
                  strokeWidth="1"
                  pointerEvents="none"
                />

                {/* Text Label */}
                <g pointerEvents="none">
                  {renderTextArc(
                    week.label,
                    R_WEEKS_TEXT,
                    week.startAngle,
                    week.endAngle,
                    14,
                  )}
                </g>
              </g>
            ))}

            {/* --- Level 2: Months Ring (Stacked on Days) --- */}
            <g filter="url(#disc-shadow)">
              <circle
                cx={CX}
                cy={CY}
                r={R_MONTHS_DISC}
                fill={isDark ? "#0f172a" : "#FEFCF8"}
                stroke={isDark ? "#334155" : "#E5E7EB"}
                strokeWidth="0.5"
              />
            </g>
            {monthsData.map((month, i) => (
              <g
                key={`month-${i}`}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomToAngle(month.midAngle, 2.5);
                }}
              >
                {/* Colored Sector Background */}
                <path
                  d={createSectorPath(
                    CX,
                    CY,
                    R_MONTHS_DISC,
                    R_ZODIAC_DISC,
                    month.startAngle,
                    month.endAngle,
                  )}
                  fill={month.color}
                  stroke="none"
                />

                {/* Separators */}
                <line
                  x1={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC,
                      month.endAngle,
                    ).x
                  }
                  y1={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC,
                      month.endAngle,
                    ).y
                  }
                  x2={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC - 40,
                      month.endAngle,
                    ).x
                  }
                  y2={
                    polarToCartesian(
                      CX,
                      CY,
                      R_MONTHS_DISC - 40,
                      month.endAngle,
                    ).y
                  }
                  stroke="white"
                  strokeWidth="2"
                  pointerEvents="none"
                />

                {/* Text Label */}
                <g pointerEvents="none">
                  {renderTextArc(
                    month.name,
                    R_MONTHS_TEXT,
                    month.startAngle,
                    month.endAngle,
                    24,
                    true,
                  )}
                </g>
              </g>
            ))}

            {/* --- Level 3: Zodiac Ring (Stacked on Months) --- */}
            <g filter="url(#disc-shadow)">
              <circle
                cx={CX}
                cy={CY}
                r={R_ZODIAC_DISC}
                fill={isDark ? "#1e293b" : "#FDFBF7"}
                stroke={isDark ? "#334155" : "#E5E7EB"}
                strokeWidth="0.5"
              />
            </g>

            {/* Zodiac Background Wedges (Gradients) */}
            {zodiacData.arcs.map((zodiac, i) => (
              <path
                key={`zodiac-bg-${i}`}
                d={`M ${CX} ${CY} L ${polarToCartesian(CX, CY, R_ZODIAC_DISC, zodiac.startAngle).x} ${polarToCartesian(CX, CY, R_ZODIAC_DISC, zodiac.startAngle).y} A ${R_ZODIAC_DISC} ${R_ZODIAC_DISC} 0 0 1 ${polarToCartesian(CX, CY, R_ZODIAC_DISC, zodiac.endAngle).x} ${polarToCartesian(CX, CY, R_ZODIAC_DISC, zodiac.endAngle).y} Z`}
                fill={zodiac.color}
                stroke="none"
              />
            ))}

            {/* Zodiac Separators and Labels */}
            {zodiacData.arcs.map((zodiac, i) => (
              <line
                key={`zodiac-line-${i}`}
                x1={
                  polarToCartesian(
                    CX,
                    CY,
                    R_ZODIAC_DISC,
                    zodiac.endAngle,
                  ).x
                }
                y1={
                  polarToCartesian(
                    CX,
                    CY,
                    R_ZODIAC_DISC,
                    zodiac.endAngle,
                  ).y
                }
                x2={
                  polarToCartesian(
                    CX,
                    CY,
                    R_ZODIAC_DISC - 30,
                    zodiac.endAngle,
                  ).x
                }
                y2={
                  polarToCartesian(
                    CX,
                    CY,
                    R_ZODIAC_DISC - 30,
                    zodiac.endAngle,
                  ).y
                }
                stroke="white"
                strokeWidth="2"
              />
            ))}

            {/* Render Zodiac Labels (Single instance per sign) */}
            {zodiacData.labels.map((zodiac, i) => (
              <g
                key={`zodiac-label-${i}`}
                style={{ filter: "grayscale(1)" }}
              >
                {/* Symbol - Large, Outer */}
                {renderTextArc(
                  zodiac.symbol,
                  R_ZODIAC_DISC - 35,
                  zodiac.midAngle - 15,
                  zodiac.midAngle + 15,
                  36,
                )}

                {/* Name - Medium, Inner */}
                {renderTextArc(
                  zodiac.name.toUpperCase(),
                  R_ZODIAC_DISC - 65,
                  zodiac.midAngle - 15,
                  zodiac.midAngle + 15,
                  14,
                  true,
                )}
              </g>
            ))}

            {/* --- Level 4: Seasons Ring (Stacked on Zodiac) --- */}
            <g filter="url(#disc-shadow)">
              <circle
                cx={CX}
                cy={CY}
                r={R_SEASONS_DISC}
                fill={isDark ? "#0f172a" : "#FEFCF8"}
                stroke={isDark ? "#334155" : "#E5E7EB"}
                strokeWidth="0.5"
              />
            </g>

            {/* Seasons Background Quadrants/Wedges */}
            {seasonsData.map((season, i) => (
              <path
                key={`season-bg-${i}`}
                d={`M ${CX} ${CY} L ${polarToCartesian(CX, CY, R_SEASONS_DISC, season.startAngle).x} ${polarToCartesian(CX, CY, R_SEASONS_DISC, season.startAngle).y} A ${R_SEASONS_DISC} ${R_SEASONS_DISC} 0 0 1 ${polarToCartesian(CX, CY, R_SEASONS_DISC, season.endAngle).x} ${polarToCartesian(CX, CY, R_SEASONS_DISC, season.endAngle).y} Z`}
                fill={season.color}
                stroke="none"
              />
            ))}

            {/* Seasons Labels */}
            {seasonLabels.map((season, i) => (
              <g key={`season-label-${i}`}>
                <path
                  id={`path-label-${season.name}`}
                  d={describeArc(
                    CX,
                    CY,
                    R_SEASONS_TEXT,
                    season.angle - 20,
                    season.angle + 20,
                  )}
                  fill="none"
                />
                <text
                  className="font-bold tracking-widest uppercase"
                  fontSize="18"
                  fill={season.color}
                  style={{ filter: "brightness(0.7)" }}
                >
                  <textPath
                    href={`#path-label-${season.name}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {season.name}
                  </textPath>
                </text>
              </g>
            ))}

            {/* --- Level 5: Center Ring (Stacked on Seasons) --- */}
            <g filter="url(#disc-shadow)">
              <circle
                cx={CX}
                cy={CY}
                r={R_CENTER_DISC}
                fill={isDark ? "#020617" : "#FFFFFF"}
                stroke={isDark ? "#334155" : "#E5E7EB"}
                strokeWidth="0.5"
              />
            </g>

            {/* End of Rotatable Group */}
          </motion.g>

          {/* --- Analog 12h Clock (Center, Non-Rotating) --- */}
          <g transform={`translate(${CX}, ${CY})`}>
            {/* Clock Background (Day/Night) */}
            <circle
              r={R_CENTER_DISC - 20}
              fill={`url(#${isDayTime ? "clock-day" : "clock-night"})`}
              opacity="0.9"
            />

            {/* Ticks & Numbers (1-12) */}
            {Array.from({ length: 60 }).map((_, i) => {
              // Render 60 minute ticks
              const angle = i * 6;
              const isHour = i % 5 === 0;
              const rTickStart = R_CENTER_DISC - 25;
              const rTickEnd =
                R_CENTER_DISC - (isHour ? 45 : 30);

              return (
                <line
                  key={`tick-${i}`}
                  x1={
                    polarToCartesian(0, 0, rTickStart, angle).x
                  }
                  y1={
                    polarToCartesian(0, 0, rTickStart, angle).y
                  }
                  x2={polarToCartesian(0, 0, rTickEnd, angle).x}
                  y2={polarToCartesian(0, 0, rTickEnd, angle).y}
                  stroke="white"
                  strokeWidth={isHour ? 4 : 1}
                  opacity={isHour ? 1 : 0.5}
                />
              );
            })}

            {/* Big Hour Numbers (1-12) */}
            {Array.from({ length: 12 }).map((_, i) => {
              const num = i === 0 ? 12 : i;
              const angle = i * 30;
              // Move numbers inward for better visibility/size
              const textPos = polarToCartesian(
                0,
                0,
                R_CENTER_DISC - 85,
                angle,
              );

              return (
                <text
                  key={`num-${num}`}
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="56"
                  fontWeight="bold"
                  className="font-sans tracking-tight"
                  style={{
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {num}
                </text>
              );
            })}

            {/* Hour Hand */}
            <line
              x1="0"
              y1="0"
              x2={polarToCartesian(0, 0, 140, hourAngle).x}
              y2={polarToCartesian(0, 0, 140, hourAngle).y}
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                filter:
                  "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
              }}
            />

            {/* Minute Hand */}
            <line
              x1="0"
              y1="0"
              x2={polarToCartesian(0, 0, 220, minuteAngle).x}
              y2={polarToCartesian(0, 0, 220, minuteAngle).y}
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.9"
              style={{
                filter:
                  "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
              }}
            />

            {/* Second Hand */}
            <g transform={`rotate(${secondAngle})`}>
              <line
                x1="0"
                y1="20"
                x2="0"
                y2="-240"
                stroke="#f43f5e"
                strokeWidth="3"
              />
              <circle cx="0" cy="0" r="6" fill="#f43f5e" />
            </g>

            {/* Center Cap */}
            <circle
              r="10"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
            />

            {/* Digital Time Label with AM/PM */}
            <g transform="translate(0, 100)">
              <rect
                x="-70"
                y="-25"
                width="140"
                height="50"
                rx="12"
                fill="black"
                fillOpacity="0.4"
                stroke="white"
                strokeWidth="1"
                strokeOpacity="0.2"
              />
              <text
                y="2"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="28"
                fontWeight="bold"
                className="font-mono tracking-widest"
              >
                {(h % 12 || 12).toString()}:
                {m.toString().padStart(2, "0")}
                <tspan
                  fontSize="18"
                  dy="-8"
                  dx="4"
                  opacity="0.9"
                >
                  {h >= 12 ? "PM" : "AM"}
                </tspan>
              </text>
            </g>
          </g>
        </motion.svg>
      </div>

      {/* Floating Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-50">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg border border-gray-200 dark:border-slate-800 rounded-xl p-2 flex flex-col gap-2">
          <button
            onClick={handleZoomToToday}
            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors text-sm font-semibold"
          >
            <CalendarIcon size={16} /> Today
          </button>
          <button
            onClick={handleZoomToWeek}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <Maximize size={16} /> This Week
          </button>
          <button
            onClick={handleZoomToMonth}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <ZoomIn size={16} /> This Month
          </button>
          <hr className="border-gray-100 dark:border-slate-800" />
          <button
            onClick={resetZoom}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <ZoomOut size={16} /> Reset View
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] hidden md:block">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Calendar Key
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>{" "}
          Solstice/Equinox
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">🌑</span> New Moon
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">🌕</span> Full Moon
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-red-500"></span> Today
        </div>
      </div>
    </div>
  );
}