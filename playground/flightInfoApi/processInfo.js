const fs = require('fs');
const files = [
  // '2829.txt',
  // '2829_2.txt',
  // '2930.txt',
  // '2930_2.txt',
]
// const { data: flights } = JSON.parse(fs.readFileSync('out2.json', 'utf8'));

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
