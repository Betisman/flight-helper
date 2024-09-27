(async function () {
  try {

    // Get the API key from Cirium FlightStats
    const apiKey = process.env.CIRIUM_FLIGHTSTATS_API_KEY;

    // Create the URL for the Cirium FlightStats API
    // const url = `https://api.flightstats.com/flex/rest/v1/schedules/flight/status?origin=PRG&destination=PRG&departureDate=2023-11-28&arrivalDate=2023-11-29&appId=${apiKey}`;
    const url = `https://api.flightstats.com/flex/rest/v1/schedules/flight/status?origin=PRG&destination=PRG&departureDate=2023-11-28&arrivalDate=2023-11-29`;

    const response = await fetch(url);
    console.log('response', response.ok)
    console.log('response', response.status)

    // const response = request.response;
    const r = await response.text();
    console.log('response', r)

    const flights = JSON.parse(response.json());

    console.log('flights', flights)

    const fs = require("fs");
    fs.writeFileSync("flights.csv", flights.map((flight) => flight.toCSV()).join("\n"));
  } catch (e) {
    console.error(e);
  }

}())