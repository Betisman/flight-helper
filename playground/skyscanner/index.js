const request = require("request");

async function findFlights(origin, destination) {
  const url = `https://skyscanner-apis.com/api/v3/browse/flights?origin=${origin}&destination=${destination}`;
  console.log(url);
  const response = await request({ url, method: "GET" });
  if (response.statusCode === 200) {
    const data = response.json();
    return data.data.results;
  } else {
    return null;
  }
}

(async () => {
  const destinations = [];
  const flightsFromOrigin = await findFlights("Faro");
  console.log(JSON.stringify(flightsFromOrigin));
  for (const flight of flightsFromOrigin) {
    destinations.push(flight.destination.iataCode);
  }

  console.log(JSON.stringify(destinations));
  return;

  const flights = [];
  for (const destination of destinations) {
    const newFlights = await findFlights(destination, "Pisa");
    flights.push(...newFlights);
  }

  for (const flight of flights) {
    console.log(`Departure: ${flight.origin.iataCode}`);
    console.log(`Arrival: ${flight.destination.iataCode}`);
  }
})();
