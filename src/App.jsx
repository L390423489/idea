import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import './index.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [streak, setStreak] = useState(0);
  const [recordStreak, setRecordStreak] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDates, setCompletedDates] = useState([]);
  const [streakSaverDates, setStreakSaverDates] = useState([]);
  const [availableStreakSavers, setAvailableStreakSavers] = useState(2);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('monday');
  const [notificationTime, setNotificationTime] = useState('20:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [lastPhraseChangeDate, setLastPhraseChangeDate] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [displayedWeekStart, setDisplayedWeekStart] = useState(new Date());
  const [normalModeDate, setNormalModeDate] = useState(new Date());
  const [testDate, setTestDate] = useState(null); // State to store the manually set test date
  const [lastStreakSaverUpdate, setLastStreakSaverUpdate] = useState(null); // State to track the last update of streak savers

  useEffect(() => {
    if (isTestMode && testDate) {
      setCurrentDate(testDate);
    } else {
      setCurrentDate(new Date());
    }
  }, [isTestMode, testDate]);

  useEffect(() => {
    updateStreakSavers();
  }, [currentDate]);

  useEffect(() => {
    calculateStreak();
    if (!currentPhrase) {
      setCurrentPhrase(getRandomPhrase());
    }
  }, [completedDates, streakSaverDates, currentDate, currentPhrase]);

  useEffect(() => {
    updateDisplayedWeek();
  }, [currentDate, firstDayOfWeek]);

  const updateStreakSavers = () => {
    const today = new Date(currentDate);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if ((!lastStreakSaverUpdate || firstOfMonth > lastStreakSaverUpdate) && recordStreak > 5) {
      setAvailableStreakSavers(prev => prev + 2);
      setLastStreakSaverUpdate(firstOfMonth);
    }
  };

  const calculateStreak = () => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0); // Ensure the time is set to the start of the day
    let currentStreak = 0;
    let date = new Date(today);

    // First, check if today is completed or saved by a streak saver
    const todayString = date.getTime(); // Get time in milliseconds for comparison
    const isCompletedToday = completedDates.map(d => new Date(d).getTime()).includes(todayString);
    const isStreakSaverToday = streakSaverDates.map(d => new Date(d).getTime()).includes(todayString);

    if (isCompletedToday || isStreakSaverToday) {
      currentStreak++;
    }

    // Now check previous days
    while (true) {
      date.setDate(date.getDate() - 1);
      const dateString = date.getTime(); // Get time in milliseconds for comparison

      const isCompleted = completedDates.map(d => new Date(d).getTime()).includes(dateString);
      const isStreakSaver = streakSaverDates.map(d => new Date(d).getTime()).includes(dateString);

      if (isCompleted || isStreakSaver) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
    if (currentStreak > recordStreak) {
      setRecordStreak(currentStreak);
    }
  };

  const markTodayCompleted = () => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0); // Reset time to start of the day
    const dateString = today.getTime(); // Store as milliseconds

    setCompletedDates(prev => {
      if (!prev.map(d => new Date(d).getTime()).includes(dateString)) {
        if (!lastPhraseChangeDate || lastPhraseChangeDate.getTime() !== today.getTime()) {
          setCurrentPhrase(getRandomPhrase());
          setLastPhraseChangeDate(today);
        }
        
        // Add logic to check the previous day
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.getTime();

        const dayBeforeYesterday = new Date(yesterday);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);
        const dayBeforeYesterdayString = dayBeforeYesterday.getTime();

        const isYesterdayCompleted = prev.map(d => new Date(d).getTime()).includes(yesterdayString);
        const isDayBeforeYesterdayCompleted = prev.map(d => new Date(d).getTime()).includes(dayBeforeYesterdayString);
        const isDayBeforeYesterdayStreakSaver = streakSaverDates.map(d => new Date(d).getTime()).includes(dayBeforeYesterdayString);

        // If yesterday is grey and day before yesterday is green or blue
        if (!isYesterdayCompleted && (isDayBeforeYesterdayCompleted || isDayBeforeYesterdayStreakSaver)) {
          if (availableStreakSavers > 0) {
            setStreakSaverDates(prevStreakSavers => [...prevStreakSavers, yesterdayString]);
            setAvailableStreakSavers(prev => Math.max(prev - 1, 0)); // Deduct one streak saver and ensure it doesn't go below 0
          }
        }

        return [...prev, dateString];
      }
      return prev;
    });
  };

  const updateDisplayedWeek = () => {
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    const diff = firstDayOfWeek === 'monday' ? (dayOfWeek + 6) % 7 : dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diff);
    setDisplayedWeekStart(weekStart);
  };

  const renderWeekCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = new Date(displayedWeekStart);

    return (
      <div className="mb-4 bg-white shadow-md rounded-lg p-4 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={goToPreviousWeek}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-semibold text-lg">{formatMonthYear(weekStart)}</span>
          <button
            onClick={goToNextWeek}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            const dateString = date.getTime();
            const isCompleted = completedDates.map(d => new Date(d).getTime()).includes(dateString);
            const isStreakSaver = streakSaverDates.map(d => new Date(d).getTime()).includes(dateString);
            const isToday = date.getTime() === currentDate.getTime();

            return (
              <div key={index} className="text-center">
                <div className="mb-1 text-sm">
                  {days[(index + (firstDayOfWeek === 'monday' ? 1 : 0)) % 7]}
                </div>
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition ${
                    isCompleted ? 'bg-green-500' :
                    isStreakSaver ? 'bg-blue-500' :
                    isToday ? 'bg-yellow-500' : 'bg-gray-300'
                  } ${isDarkMode ? 'text-white' : 'text-black'} ${
                    isToday ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(displayedWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setDisplayedWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(displayedWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setDisplayedWeekStart(newWeekStart);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatCurrentDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const emojiProgression = [
    { threshold: 0, emoji: '🌱' },    // Seedling
    { threshold: 1, emoji: '🌿' },    // Herb
    { threshold: 2, emoji: '🍃' },    // Leaf Fluttering in Wind
    { threshold: 3, emoji: '🌳' },    // Deciduous Tree
    { threshold: 4, emoji: '🌴' },    // Palm Tree
    { threshold: 5, emoji: '🌲' },    // Evergreen Tree
    { threshold: 6, emoji: '🌵' },    // Cactus
    { threshold: 7, emoji: '🌾' },    // Sheaf of Rice
    { threshold: 8, emoji: '🌻' },    // Sunflower
    { threshold: 9, emoji: '🌼' },    // Blossom
    { threshold: 10, emoji: '🌷' },   // Tulip
    { threshold: 11, emoji: '🌹' },   // Rose
    { threshold: 12, emoji: '🌸' },   // Cherry Blossom
    { threshold: 13, emoji: '🌺' },   // Hibiscus
    { threshold: 14, emoji: '🍄' },   // Mushroom
    { threshold: 15, emoji: '🍁' },   // Maple Leaf
    { threshold: 16, emoji: '🍂' },   // Fallen Leaf
    { threshold: 17, emoji: '🌍' },   // Earth Globe Europe-Africa
    { threshold: 18, emoji: '🌎' },   // Earth Globe Americas
    { threshold: 19, emoji: '🌏' },   // Earth Globe Asia-Australia
    { threshold: 20, emoji: '🌕' },   // Full Moon
    { threshold: 21, emoji: '🌖' },   // Waning Gibbous Moon
    { threshold: 22, emoji: '🌗' },   // Last Quarter Moon
    { threshold: 23, emoji: '🌘' },   // Waning Crescent Moon
    { threshold: 24, emoji: '🌑' },   // New Moon
    { threshold: 25, emoji: '🌒' },   // Waxing Crescent Moon
    { threshold: 26, emoji: '🌓' },   // First Quarter Moon
    { threshold: 27, emoji: '🌔' },   // Waxing Gibbous Moon
    { threshold: 28, emoji: '🌙' },   // Crescent Moon
    { threshold: 29, emoji: '🌛' },   // First Quarter Moon with Face
    { threshold: 30, emoji: '🌜' },   // Last Quarter Moon with Face
    { threshold: 31, emoji: '🌞' },   // Sun with Face
    { threshold: 32, emoji: '⭐' },    // Star
    { threshold: 33, emoji: '🌟' },    // Glowing Star
    { threshold: 34, emoji: '💫' },    // Dizzy
    { threshold: 35, emoji: '✨' },    // Sparkles
    { threshold: 36, emoji: '⚡' },    // High Voltage
    { threshold: 37, emoji: '🔥' },    // Fire
    { threshold: 38, emoji: '🌪️' },   // Tornado
    { threshold: 39, emoji: '🌈' },    // Rainbow
    { threshold: 40, emoji: '☀️' },    // Sun
    { threshold: 41, emoji: '🌦️' },   // Sun Behind Rain Cloud
    { threshold: 42, emoji: '🌧️' },   // Cloud with Rain
    { threshold: 43, emoji: '⛅' },    // Sun Behind Cloud
    { threshold: 44, emoji: '☁️' },    // Cloud
    { threshold: 45, emoji: '❄️' },    // Snowflake
    { threshold: 46, emoji: '🌨️' },   // Cloud with Snow
    { threshold: 47, emoji: '🌩️' },   // Cloud with Lightning
    { threshold: 48, emoji: '🌊' },    // Water Wave
    { threshold: 49, emoji: '🌋' },    // Volcano
    { threshold: 50, emoji: '🏔️' },   // Snow-Capped Mountain
    { threshold: 51, emoji: '⛰️' },    // Mountain
    { threshold: 52, emoji: '🏕️' },   // Camping
    { threshold: 53, emoji: '🏖️' },   // Beach with Umbrella
    { threshold: 54, emoji: '🏜️' },   // Desert
    { threshold: 55, emoji: '🏝️' },   // Desert Island
    { threshold: 56, emoji: '🏞️' },   // National Park
    { threshold: 57, emoji: '🌅' },    // Sunrise
    { threshold: 58, emoji: '🌄' },    // Sunrise Over Mountains
    { threshold: 59, emoji: '🌇' },    // Sunset
    { threshold: 60, emoji: '🌆' },    // Cityscape at Dusk
    { threshold: 61, emoji: '🌃' },    // Night with Stars
    { threshold: 62, emoji: '🌉' },    // Bridge at Night
    { threshold: 63, emoji: '🌌' },    // Milky Way
    { threshold: 64, emoji: '🗻' },    // Mount Fuji
    { threshold: 65, emoji: '🏰' },    // Castle
    { threshold: 66, emoji: '🏯' },    // Japanese Castle
    { threshold: 67, emoji: '🏟️' },   // Stadium
    { threshold: 68, emoji: '🎡' },    // Ferris Wheel
    { threshold: 69, emoji: '🎢' },    // Roller Coaster
    { threshold: 70, emoji: '🎠' },    // Carousel Horse
    { threshold: 71, emoji: '🚀' },    // Rocket
    { threshold: 72, emoji: '🛰️' },   // Satellite
    { threshold: 73, emoji: '🛸' },    // Flying Saucer
    { threshold: 74, emoji: '🌠' },    // Shooting Star
    { threshold: 75, emoji: '🎇' },    // Sparkler
    { threshold: 76, emoji: '🎆' },    // Fireworks
    { threshold: 77, emoji: '🧭' },    // Compass
    { threshold: 78, emoji: '🗺️' },   // World Map
    { threshold: 79, emoji: '🗿' },    // Moai
    { threshold: 80, emoji: '🛤️' },   // Railway Track
    { threshold: 81, emoji: '🚂' },    // Locomotive
    { threshold: 82, emoji: '🛣️' },   // Motorway
    { threshold: 83, emoji: '🌀' },    // Cyclone
    { threshold: 84, emoji: '🌁' },    // Foggy
    { threshold: 85, emoji: '💐' },    // Bouquet
    { threshold: 86, emoji: '🥀' },    // Wilted Flower
    { threshold: 87, emoji: '🍀' },    // Four Leaf Clover
    { threshold: 88, emoji: '🌰' },    // Chestnut
    { threshold: 89, emoji: '🍇' },    // Grapes
    { threshold: 90, emoji: '🍈' },    // Melon
    { threshold: 91, emoji: '🍉' },    // Watermelon
    { threshold: 92, emoji: '🍊' },    // Tangerine
    { threshold: 93, emoji: '🍋' },    // Lemon
    { threshold: 94, emoji: '🍌' },    // Banana
    { threshold: 95, emoji: '🍍' },    // Pineapple
    { threshold: 96, emoji: '🍎' },    // Red Apple
    { threshold: 97, emoji: '🍏' },    // Green Apple
    { threshold: 98, emoji: '🍐' },    // Pear
    { threshold: 99, emoji: '🍑' },    // Peach
    { threshold: 100, emoji: '🍒' },   // Cherries
    { threshold: 101, emoji: '🍓' },   // Strawberry
    { threshold: 102, emoji: '🥝' },   // Kiwi Fruit
    { threshold: 103, emoji: '🥑' },   // Avocado
    { threshold: 104, emoji: '🍆' },   // Eggplant
    { threshold: 105, emoji: '🥔' },   // Potato
    { threshold: 106, emoji: '🥕' },   // Carrot
    { threshold: 107, emoji: '🌽' },   // Ear of Corn
    { threshold: 108, emoji: '🌶️' },  // Hot Pepper
    { threshold: 109, emoji: '🥒' },   // Cucumber
    { threshold: 110, emoji: '🥦' },   // Broccoli
    { threshold: 111, emoji: '🥬' },   // Leafy Green
    { threshold: 112, emoji: '🥭' },   // Mango
    { threshold: 113, emoji: '🥥' },   // Coconut
    { threshold: 114, emoji: '🥐' },   // Croissant
    { threshold: 115, emoji: '🥖' },   // Baguette Bread
    { threshold: 116, emoji: '🥨' },   // Pretzel
    { threshold: 117, emoji: '🥯' },   // Bagel
    { threshold: 118, emoji: '🥞' },   // Pancakes
    { threshold: 119, emoji: '🧇' },   // Waffle
    { threshold: 120, emoji: '🧈' },   // Butter
    { threshold: 121, emoji: '🥚' },   // Egg
    { threshold: 122, emoji: '🥓' },   // Bacon
    { threshold: 123, emoji: '🥩' },   // Cut of Meat
    { threshold: 124, emoji: '🍗' },   // Poultry Leg
    { threshold: 125, emoji: '🍖' },   // Meat on Bone
    { threshold: 126, emoji: '🌭' },   // Hot Dog
    { threshold: 127, emoji: '🍔' },   // Hamburger
    { threshold: 128, emoji: '🍟' },   // French Fries
    { threshold: 129, emoji: '🍕' },   // Pizza
    { threshold: 130, emoji: '🌮' },   // Taco
    { threshold: 131, emoji: '🌯' },   // Burrito
    { threshold: 132, emoji: '🥙' },   // Stuffed Flatbread
    { threshold: 133, emoji: '🥪' },   // Sandwich
    { threshold: 134, emoji: '🥗' },   // Green Salad
    { threshold: 135, emoji: '🥘' },   // Shallow Pan of Food
    { threshold: 136, emoji: '🍲' },   // Pot of Food
    { threshold: 137, emoji: '🍜' },   // Steaming Bowl
    { threshold: 138, emoji: '🍝' },   // Spaghetti
    { threshold: 139, emoji: '🍣' },   // Sushi
    { threshold: 140, emoji: '🍤' },   // Fried Shrimp
    { threshold: 141, emoji: '🍙' },   // Rice Ball
    { threshold: 142, emoji: '🍚' },   // Cooked Rice
    { threshold: 143, emoji: '🍛' },   // Curry Rice
    { threshold: 144, emoji: '🍥' },   // Fish Cake with Swirl
    { threshold: 145, emoji: '🥮' },   // Moon Cake
    { threshold: 146, emoji: '🍡' },   // Dango
    { threshold: 147, emoji: '🍧' },   // Shaved Ice
    { threshold: 148, emoji: '🍨' },   // Ice Cream
    { threshold: 149, emoji: '🍦' },   // Soft Ice Cream
    { threshold: 150, emoji: '🥧' },   // Pie
    { threshold: 151, emoji: '🍰' },   // Shortcake
    { threshold: 152, emoji: '🎂' },   // Birthday Cake
    { threshold: 153, emoji: '🧁' },   // Cupcake
    { threshold: 154, emoji: '🍮' },   // Custard
    { threshold: 155, emoji: '🍭' },   // Lollipop
    { threshold: 156, emoji: '🍬' },   // Candy
    { threshold: 157, emoji: '🍫' },   // Chocolate Bar
    { threshold: 158, emoji: '🍿' },   // Popcorn
    { threshold: 159, emoji: '🍩' },   // Doughnut
    { threshold: 160, emoji: '🍪' },   // Cookie
    { threshold: 161, emoji: '🥜' },   // Peanuts
    { threshold: 162, emoji: '🍯' },   // Honey Pot
    { threshold: 163, emoji: '🥛' },   // Glass of Milk
    { threshold: 164, emoji: '🍵' },   // Teacup Without Handle
    { threshold: 165, emoji: '🍶' },   // Sake
    { threshold: 166, emoji: '🍺' },   // Beer Mug
    { threshold: 167, emoji: '🍻' },   // Clinking Beer Mugs
    { threshold: 168, emoji: '🥂' },   // Clinking Glasses
    { threshold: 169, emoji: '🍷' },   // Wine Glass
    { threshold: 170, emoji: '🥃' },   // Tumbler Glass
    { threshold: 171, emoji: '🍸' },   // Cocktail Glass
    { threshold: 172, emoji: '🍹' },   // Tropical Drink
    { threshold: 173, emoji: '🍾' },   // Bottle with Popping Cork
    { threshold: 174, emoji: '🍽️' },  // Fork and Knife with Plate
    { threshold: 175, emoji: '🍴' },   // Fork and Knife
    { threshold: 176, emoji: '🥄' },   // Spoon
    { threshold: 177, emoji: '🚣' },   // Rowboat
    { threshold: 178, emoji: '🏊' },   // Swimmer
    { threshold: 179, emoji: '🚴' },   // Bicyclist
    { threshold: 180, emoji: '🚵' },   // Mountain Bicyclist
    { threshold: 181, emoji: '🏇' },   // Horse Racing
    { threshold: 182, emoji: '🏌️' },  // Golfer
    { threshold: 183, emoji: '🏄' },   // Surfer
    { threshold: 184, emoji: '🏂' },   // Snowboarder
    { threshold: 185, emoji: '🏋️' },  // Weightlifter
    { threshold: 186, emoji: '🤼' },   // Wrestlers
    { threshold: 187, emoji: '🤸' },   // Person Cartwheeling
    { threshold: 188, emoji: '⛹️' },  // Person Bouncing Ball
    { threshold: 189, emoji: '🤾' },   // Person Playing Handball
    { threshold: 190, emoji: '🤽' },   // Person Playing Water Polo
    { threshold: 191, emoji: '🎳' },   // Bowling
    { threshold: 192, emoji: '🥋' },   // Martial Arts Uniform
    { threshold: 193, emoji: '🥊' },   // Boxing Glove
    { threshold: 194, emoji: '🥅' },   // Goal Net
    { threshold: 195, emoji: '⛳' },   // Flag in Hole
    { threshold: 196, emoji: '🏒' },   // Ice Hockey
    { threshold: 197, emoji: '🏓' },   // Ping Pong
    { threshold: 198, emoji: '🏏' },   // Cricket Game
    { threshold: 199, emoji: '🏑' },   // Field Hockey
    { threshold: 200, emoji: '🎣' },   // Fishing Pole
    { threshold: 201, emoji: '🤿' },   // Diving Mask
    { threshold: 202, emoji: '🎿' },   // Skis
    { threshold: 203, emoji: '🥌' },   // Curling Stone
    { threshold: 204, emoji: '🥇' },   // 1st Place Medal
    { threshold: 205, emoji: '🥈' },   // 2nd Place Medal
    { threshold: 206, emoji: '🥉' },   // 3rd Place Medal
    { threshold: 207, emoji: '🏆' },   // Trophy
    { threshold: 208, emoji: '🎮' },   // Video Game
    { threshold: 209, emoji: '🕹️' },  // Joystick
    { threshold: 210, emoji: '🎰' },   // Slot Machine
    { threshold: 211, emoji: '🎲' },   // Game Die
    { threshold: 212, emoji: '🎯' },   // Direct Hit
    { threshold: 213, emoji: '🎱' },   // Pool 8 Ball
    { threshold: 214, emoji: '🏹' },   // Bow and Arrow
    { threshold: 215, emoji: '🛷' },   // Sled
    { threshold: 216, emoji: '🎡' },   // Ferris Wheel
    { threshold: 217, emoji: '🎢' },   // Roller Coaster
    { threshold: 218, emoji: '🎠' },   // Carousel Horse
    { threshold: 219, emoji: '🎤' },   // Microphone
    { threshold: 220, emoji: '🎧' },   // Headphone
    { threshold: 221, emoji: '🎼' },   // Musical Score
    { threshold: 222, emoji: '🎹' },   // Musical Keyboard
    { threshold: 223, emoji: '🥁' },   // Drum
    { threshold: 224, emoji: '🎷' },   // Saxophone
    { threshold: 225, emoji: '🎺' },   // Trumpet
    { threshold: 226, emoji: '🎸' },   // Guitar
    { threshold: 227, emoji: '🪕' },   // Banjo
    { threshold: 228, emoji: '🎻' },   // Violin
    { threshold: 229, emoji: '🎬' },   // Clapper Board
    { threshold: 230, emoji: '🎨' },   // Artist Palette
    { threshold: 231, emoji: '🖌️' },  // Paintbrush
    { threshold: 232, emoji: '🖍️' },  // Crayon
    { threshold: 233, emoji: '🎭' },   // Performing Arts
    { threshold: 234, emoji: '🎯' },   // Direct Hit
    { threshold: 235, emoji: '🧩' },   // Puzzle Piece
    { threshold: 236, emoji: '🃏' },   // Joker
    { threshold: 237, emoji: '🎴' },   // Flower Playing Cards
    { threshold: 238, emoji: '🎰' },   // Slot Machine
    { threshold: 239, emoji: '🎲' },   // Game Die
    { threshold: 240, emoji: '🎳' },   // Bowling
    { threshold: 241, emoji: '🎨' },   // Artist Palette
    { threshold: 242, emoji: '🖌️' },  // Paintbrush
    { threshold: 243, emoji: '🖍️' },  // Crayon
    { threshold: 244, emoji: '🎧' },   // Headphone
    { threshold: 245, emoji: '🎷' },   // Saxophone
    { threshold: 246, emoji: '🎸' },   // Guitar
    { threshold: 247, emoji: '🎺' },   // Trumpet
    { threshold: 248, emoji: '🥁' },   // Drum
    { threshold: 249, emoji: '🎻' },   // Violin
    { threshold: 250, emoji: '🎬' },   // Clapper Board
    { threshold: 251, emoji: '🪕' },   // Banjo
    { threshold: 252, emoji: '🎭' },   // Performing Arts
    { threshold: 253, emoji: '🎨' },   // Artist Palette
    { threshold: 254, emoji: '🖌️' },  // Paintbrush
    { threshold: 255, emoji: '🖍️' },  // Crayon
    { threshold: 256, emoji: '🎯' },   // Direct Hit
    { threshold: 257, emoji: '🧩' },   // Puzzle Piece
    { threshold: 258, emoji: '🃏' },   // Joker
    { threshold: 259, emoji: '🎴' },   // Flower Playing Cards
    { threshold: 260, emoji: '🎰' },   // Slot Machine
    { threshold: 261, emoji: '🎲' },   // Game Die
    { threshold: 262, emoji: '🎳' },   // Bowling
    { threshold: 263, emoji: '🛷' },   // Sled
    { threshold: 264, emoji: '🎡' },   // Ferris Wheel
    { threshold: 265, emoji: '🎢' },   // Roller Coaster
    { threshold: 266, emoji: '🎠' },   // Carousel Horse
    { threshold: 267, emoji: '🎤' },   // Microphone
    { threshold: 268, emoji: '🎧' },   // Headphone
    { threshold: 269, emoji: '🎼' },   // Musical Score
    { threshold: 270, emoji: '🎹' },   // Musical Keyboard
    { threshold: 271, emoji: '🥁' },   // Drum
    { threshold: 272, emoji: '🎷' },   // Saxophone
    { threshold: 273, emoji: '🎺' },   // Trumpet
    { threshold: 274, emoji: '🎸' },   // Guitar
    { threshold: 275, emoji: '🪕' },   // Banjo
    { threshold: 276, emoji: '🎻' },   // Violin
    { threshold: 277, emoji: '🎬' },   // Clapper Board
    { threshold: 278, emoji: '🎨' },   // Artist Palette
    { threshold: 279, emoji: '🖌️' },  // Paintbrush
    { threshold: 280, emoji: '🖍️' },  // Crayon
    { threshold: 281, emoji: '🎭' },   // Performing Arts
    { threshold: 282, emoji: '🧩' },   // Puzzle Piece
    { threshold: 283, emoji: '🃏' },   // Joker
    { threshold: 284, emoji: '🎴' },   // Flower Playing Cards
    { threshold: 285, emoji: '🎰' },   // Slot Machine
    { threshold: 286, emoji: '🎲' },   // Game Die
    { threshold: 287, emoji: '🎳' },   // Bowling
    { threshold: 288, emoji: '🎧' },   // Headphone
    { threshold: 289, emoji: '🎷' },   // Saxophone
    { threshold: 290, emoji: '🎸' },   // Guitar
    { threshold: 291, emoji: '🎺' },   // Trumpet
    { threshold: 292, emoji: '🥁' },   // Drum
    { threshold: 293, emoji: '🎻' },   // Violin
    { threshold: 294, emoji: '🎬' },   // Clapper Board
    { threshold: 295, emoji: '🪕' },   // Banjo
    { threshold: 296, emoji: '🎭' },   // Performing Arts
    { threshold: 297, emoji: '🎨' },   // Artist Palette
    { threshold: 298, emoji: '🖌️' },  // Paintbrush
    { threshold: 299, emoji: '🖍️' },  // Crayon
    { threshold: 300, emoji: '🎯' },   // Direct Hit
    { threshold: 301, emoji: '🧩' },   // Puzzle Piece
    { threshold: 302, emoji: '🃏' },   // Joker
    { threshold: 303, emoji: '🎴' },   // Flower Playing Cards
    { threshold: 304, emoji: '🎰' },   // Slot Machine
    { threshold: 305, emoji: '🎲' },   // Game Die
    { threshold: 306, emoji: '🎳' },   // Bowling
    { threshold: 307, emoji: '🎧' },   // Headphone
    { threshold: 308, emoji: '🎷' },   // Saxophone
    { threshold: 309, emoji: '🎸' },   // Guitar
    { threshold: 310, emoji: '🎺' },   // Trumpet
    { threshold: 311, emoji: '🥁' },   // Drum
    { threshold: 312, emoji: '🎻' },   // Violin
    { threshold: 313, emoji: '🎬' },   // Clapper Board
    { threshold: 314, emoji: '🪕' },   // Banjo
    { threshold: 315, emoji: '🎭' },   // Performing Arts
    { threshold: 316, emoji: '🎨' },   // Artist Palette
    { threshold: 317, emoji: '🖌️' },  // Paintbrush
    { threshold: 318, emoji: '🖍️' },  // Crayon
    { threshold: 319, emoji: '🎧' },   // Headphone
    { threshold: 320, emoji: '🎷' },   // Saxophone
    { threshold: 321, emoji: '🎸' },   // Guitar
    { threshold: 322, emoji: '🎺' },   // Trumpet
    { threshold: 323, emoji: '🥁' },   // Drum
    { threshold: 324, emoji: '🎻' },   // Violin
    { threshold: 325, emoji: '🎬' },   // Clapper Board
    { threshold: 326, emoji: '🪕' },   // Banjo
    { threshold: 327, emoji: '🎭' },   // Performing Arts
    { threshold: 328, emoji: '🎨' },   // Artist Palette
    { threshold: 329, emoji: '🖌️' },  // Paintbrush
    { threshold: 330, emoji: '🖍️' },  // Crayon
    { threshold: 331, emoji: '🎧' },   // Headphone
    { threshold: 332, emoji: '🎷' },   // Saxophone
    { threshold: 333, emoji: '🎸' },   // Guitar
    { threshold: 334, emoji: '🎺' },   // Trumpet
    { threshold: 335, emoji: '🥁' },   // Drum
    { threshold: 336, emoji: '🎻' },   // Violin
    { threshold: 337, emoji: '🎬' },   // Clapper Board
    { threshold: 338, emoji: '🪕' },   // Banjo
    { threshold: 339, emoji: '🎭' },   // Performing Arts
    { threshold: 340, emoji: '🎨' },   // Artist Palette
    { threshold: 341, emoji: '🖌️' },  // Paintbrush
    { threshold: 342, emoji: '🖍️' },  // Crayon
    { threshold: 343, emoji: '🎧' },   // Headphone
    { threshold: 344, emoji: '🎷' },   // Saxophone
    { threshold: 345, emoji: '🎸' },   // Guitar
    { threshold: 346, emoji: '🎺' },   // Trumpet
    { threshold: 347, emoji: '🥁' },   // Drum
    { threshold: 348, emoji: '🎻' },   // Violin
    { threshold: 349, emoji: '🎬' },   // Clapper Board
    { threshold: 350, emoji: '🪕' },   // Banjo
    { threshold: 351, emoji: '🎭' },   // Performing Arts
    { threshold: 352, emoji: '🎨' },   // Artist Palette
    { threshold: 353, emoji: '🖌️' },  // Paintbrush
    { threshold: 354, emoji: '🖍️' },  // Crayon
    { threshold: 355, emoji: '🎧' },   // Headphone
    { threshold: 356, emoji: '🎷' },   // Saxophone
    { threshold: 357, emoji: '🎸' },   // Guitar
    { threshold: 358, emoji: '🎺' },   // Trumpet
    { threshold: 359, emoji: '🥁' },   // Drum
    { threshold: 360, emoji: '🎻' },   // Violin
    { threshold: 361, emoji: '🎬' },   // Clapper Board
    { threshold: 362, emoji: '🪕' },   // Banjo
    { threshold: 363, emoji: '🎭' },   // Performing Arts
    { threshold: 364, emoji: '🎨' },   // Artist Palette
];

const getStreakEmoji = (streakCount) => {
  const index = streakCount % 365; // Get the remainder to repeat after 365 days
  const relevantProgression = emojiProgression.find((e, i) => index >= e.threshold && (i === emojiProgression.length - 1 || index < emojiProgression[i + 1].threshold));
  return relevantProgression ? relevantProgression.emoji : '🌱'; // Default to 🌱 if something goes wrong
};

  const formatStreak = (days) => {
    if (days < 365) return `${days} days`;
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    return `${years} year${years > 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  };

  const getRandomPhrase = () => {
    const phrases = [
      "Consistency is the key to success!",
      "Small steps, big impact!",
      "Every day is a new opportunity!",
      "You're building something amazing!",
      "Progress, not perfection!",
      "Habits form character!",
      "One day at a time!",
      "You're on a roll!",
      "Keep the momentum going!",
      "Your future self will thank you!",
      "Embrace the journey!",
      "Success is a series of small wins!",
      "You're making it happen!",
      "Strength grows through consistency!",
      "Each day is a building block!",
      "You're crafting your destiny!",
      "Small habits, big results!",
      "Your dedication is inspiring!",
      "Every streak starts with day one!",
      "You're proving your commitment!",
      "Consistency breeds excellence!",
      "You're writing your success story!",
      "Keep pushing your limits!",
      "Your persistence is powerful!",
      "You're turning goals into reality!",
      "Habits are the compound interest of self-improvement!",
      "You're becoming unstoppable!",
      "Success loves consistency!",
      "You're building an empire of good habits!",
      "Every day counts!",
      "You're creating a masterpiece, one day at a time!",
      "Discipline is the bridge between goals and accomplishment!",
      "You're transforming yourself!",
      "Consistency is your superpower!",
      "You're laying the foundation for greatness!",
      "Keep stacking those wins!",
      "You're mastering the art of persistence!",
      "Consistency is the mother of mastery!",
      "You're paving the way to success!",
      "Your habits shape your future!",
    ];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const handleTestDateChange = (e) => {
    const input = e.target.value;
    const [day, month, year] = input.split('/').map(Number);
    const newDate = new Date(`20${year}`, month - 1, day);

    if (!isNaN(newDate.getTime())) {
      setTestDate(newDate);
    } else {
      console.error('Invalid date format');
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} min-h-screen flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Everyday</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDarkModeToggle}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <h2 className="text-4xl font-bold text-center">{formatCurrentDate(currentDate)}</h2>
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-6xl">
              {formatStreak(streak)} {getStreakEmoji(streak)}
            </p>
          </div>

          {renderWeekCalendar()}
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <p className="text-lg italic text-center">{currentPhrase}</p>
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <h3>Available Streak Savers: {availableStreakSavers}</h3>
          <h3>Streak Record: {formatStreak(recordStreak)}</h3>
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <button
            onClick={markTodayCompleted}
            className="w-full mt-4 btn-large bg-green-500 text-white font-bold hover:bg-green-600 transition"
          >
            Mark as Completed
          </button>
        </div>

        <div className="mb-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isTestMode}
              onChange={() => setIsTestMode(!isTestMode)}
            />
            <span>Enable Test Mode</span>
          </label>
          {isTestMode && (
            <input
              type="text"
              placeholder="DD/MM/YY"
              onChange={handleTestDateChange}
              className="mt-2 p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default App;
