const http = require("http");

const apiKey = process.env.OPENSKY_API_KEY;

const url = `https://opensky-network.org/api/states/all?icao=PRG&from=2023-11-28T00:00:00Z&to=2023-11-29T23:59:59Z&appid=${apiKey}`;

const request = http.get(url);

const response = await request.response;

const flights = JSON.parse(response.body);

const fs = require("fs");
fs.writeFileSync("flights.csv", flights.map((flight) => flight.toCSV()).join("\n"));
