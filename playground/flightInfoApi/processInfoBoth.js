const fs = require('fs');
const filesTo = [
  'filesTo.txt',
];
const filesFrom = [
  'filesFrom.txt',
]
// const { data: flights } = JSON.parse(fs.readFileSync('out2.json', 'utf8'));



const filesToFlights = (files) => {
  let flights = [];
  files.forEach((file) => {
    const { data: flightsFile } = JSON.parse(fs.readFileSync(file, 'utf8'));
    flights = [...flights, ...flightsFile];
  });

  flights.forEach((flight) => {
    const {
      carrier: { iata: carrierIata, icao: carrierIcao },
      flightNumber,
      departure: {
        airport: { iata: departureIata },
        date: { local: departureDate, utc: departureDateUtc },
        time: { local: departureTime, utc: departureTimeUtc },
      },
      arrival: {
        airport: { iata: arrivalIata },
        date: { local: arrivalDate, utc: arrivalDateUtc },
        time: { local: arrivalTime, utc: arrivalTimeUtc },
      },
      elapsedTime,
    } = flight;

    console.log(`${carrierIata}${flightNumber}\t${departureIata}\t->\t${arrivalIata}\t--\t${departureDate}\t${departureTime}\t=>\t${arrivalDate}\t${arrivalTime}`);
  });
  return flights;
};

const flightsFrom = filesToFlights(filesFrom);
const flightsTo = filesToFlights(filesTo);

let fromOriginStops = [];
flightsFrom.forEach(({ arrival: { airport: { iata: arrivalIata } } }) => {
  fromOriginStops.push(arrivalIata);
});
// dedupe fromOriginStops
fromOriginStops = [...new Set(fromOriginStops)];

let toDestStops = [];
flightsTo.forEach(({ departure: { airport: { iata: departureIata } } }) => {
  toDestStops.push(departureIata);
});
// dedupe toDestStops
toDestStops = [...new Set(toDestStops)];

// find which aiports are in both arrays
const stops = [];
fromOriginStops.forEach((stop) => {
  if (toDestStops.includes(stop)) {
    stops.push(stop);
  }
});
console.log("🚀 ~ file: processInfoBoth.js:55 ~ stops:", stops)

// from the stops, find the flights that go from ORIGIN to DEST
const flights = [];
flightsFrom.forEach((flight) => {
  const { arrival: { airport: { iata: arrivalIata } } } = flight;
  if (stops.includes(arrivalIata)) {
    flights.push(flight);
  }
});
console.log("🚀 ~ file: processInfoBoth.js:65 ~ flights", flights)

flightsTo.forEach((flight) => {
  const { departure: { airport: { iata: departureIata } } } = flight;
  if (stops.includes(departureIata)) {
    flights.push(flight);
  }
});
console.log("🚀 ~ file: processInfoBoth.js:65 ~ flights", flights)

flights.forEach((flight) => {
  const {
    carrier: { iata: carrierIata, icao: carrierIcao },
    flightNumber,
    departure: {
      airport: { iata: departureIata },
      date: { local: departureDate, utc: departureDateUtc },
      time: { local: departureTime, utc: departureTimeUtc },
    },
    arrival: {
      airport: { iata: arrivalIata },
      date: { local: arrivalDate, utc: arrivalDateUtc },
      time: { local: arrivalTime, utc: arrivalTimeUtc },
    },
    elapsedTime,
  } = flight;

  console.log(`${carrierIata}${flightNumber}\t${departureIata}\t->\t${arrivalIata}\t--\t${departureDate}\t${departureTime}\t=>\t${arrivalDate}\t${arrivalTime}`);
});
