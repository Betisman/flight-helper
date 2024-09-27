const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

// Configuración de la API Flight-Info
const FLIGHT_INFO_API_KEY = process.env.FLIGHT_INFO_API_KEY;
const FLIGHT_INFO_API_HOST = process.env.FLIGHT_INFO_API_HOST;

// Lista de aeropuertos principales para origen y destino
const MAIN_AIRPORTS = {
  'Valencia': ['VLC'],
  'Chisinau': ['KIV', 'RMO'],
  'Madrid': ['MAD'],
  'Barcelona': ['BCN'],
  'London': ['LHR', 'LGW', 'STN'],
  'Paris': ['CDG', 'ORY'],
  'New York': ['JFK', 'LGA', 'EWR'],
  'Tokyo': ['NRT', 'HND'],
};

function isAfter17(time) {
  return moment(time).hours() >= 17;
}

async function searchFlightsFrom(origin, date) {
  try {
    console.log(`origin: ${origin} date: ${date}`)
    const options = {
      method: 'GET', url: `https://${FLIGHT_INFO_API_HOST}/schedules`,
      params: {
        version: 'v2',
        DepartureAirport: origin,
        DepartureDateTime: date,
        CodeType: 'IATA',
        ServiceType: 'Passenger',
      },
      headers: {
        'X-RapidAPI-Key': FLIGHT_INFO_API_KEY,
        'X-RapidAPI-Host': FLIGHT_INFO_API_HOST
      }
    };

    let response = await axios.request(options);

    const data = response.data.data;
    let paging = response.data.paging;

    let end = response.data.paging.next === '';
    while (!end) {
      options.params.After = paging.next;
      response = await axios.request(options);
      data.push(...response.data.data);
      end = response.data.paging.next === '';
      paging = response.data.paging;
    }
    console.log(data.length)

    return data.filter(flight => isAfter17(flight.departure.scheduled));
  } catch (error) {
    console.error(`Error searching for flights from ${origin}:`, error);
    return [];
  }
}

async function searchDirectFlights(origin, destination, date) {
  const flights = await searchFlightsFrom(origin, date);
  return flights.filter(flight => flight.arrival.iata === destination);
}

async function searchFlightsWithDynamicLayovers(originCity, destinationCity, departureDate) {
  const originAirports = MAIN_AIRPORTS[originCity] || [];
  const destinationAirports = MAIN_AIRPORTS[destinationCity] || [];

  if (originAirports.length === 0 || destinationAirports.length === 0) {
    console.error('No airports found for the specified cities');
    return [];
  }

  let allRoutes = [];

  for (const origin of originAirports) {
    for (const destination of destinationAirports) {
      // Búsqueda de vuelos directos
      const directFlights = await searchDirectFlights(origin, destination, departureDate);
      allRoutes = allRoutes.concat(directFlights.map(flight => [{
        origin: origin,
        destination: destination,
        departureTime: flight.departure.scheduled,
        arrivalTime: flight.arrival.scheduled,
        airline: flight.airline.name,
        flightNumber: flight.flight.number
      }]));

      const potentialLayovers = await searchFlightsFrom(origin, departureDate);
      for (const layoverFlight of potentialLayovers) {
        const layover = layoverFlight.arrival.iata;
        if (layover !== destination) {
          const leg2Date = moment(layoverFlight.arrival.scheduled).format('YYYY-MM-DD');
          const leg2 = await searchDirectFlights(layover, destination, leg2Date);

          for (const flight2 of leg2) {
            if (moment(flight2.departure.scheduled).isAfter(moment(layoverFlight.arrival.scheduled).add(2, 'hours'))) {
              allRoutes.push([
                {
                  origin: origin,
                  destination: layover,
                  departureTime: layoverFlight.departure.scheduled,
                  arrivalTime: layoverFlight.arrival.scheduled,
                  airline: layoverFlight.airline.name,
                  flightNumber: layoverFlight.flight.number
                },
                {
                  origin: layover,
                  destination: destination,
                  departureTime: flight2.departure.scheduled,
                  arrivalTime: flight2.arrival.scheduled,
                  airline: flight2.airline.name,
                  flightNumber: flight2.flight.number
                }
              ]);
            }
          }
        }
      }
    }
  }

  const validRoutes = allRoutes.filter(route => route.every(flight => isAfter17(flight.departureTime)));

  validRoutes.sort((a, b) => {
    const timeA = moment(a[a.length - 1].arrivalTime).diff(moment(a[0].departureTime));
    const timeB = moment(b[b.length - 1].arrivalTime).diff(moment(b[0].departureTime));
    return timeA - timeB;
  });

  return validRoutes.slice(0, 5); // Devolver las 5 mejores rutas
}

async function getFlightStatus(flightNumber, date) {
  try {
    const response = await axios.get(`https://${FLIGHT_INFO_API_HOST}/status`, {
      params: {
        version: 'v2',
        FlightNumber: flightNumber,
        DepartureDateTime: date
      },
      headers: {
        'X-RapidAPI-Key': FLIGHT_INFO_API_KEY,
        'X-RapidAPI-Host': FLIGHT_INFO_API_HOST
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting the status of flight ${flightNumber}:`, error);
    return null;
  }
}

const departureDateFormatted = moment().add(7, 'days').format('YYYY-MM-DD');
searchFlightsWithDynamicLayovers('Valencia', 'Chisinau', departureDateFormatted)
  .then(routes => {
    console.log(JSON.stringify(routes, null, 2));

    if (routes.length > 0 && routes[0].length > 0) {
      const firstFlight = routes[0][0];
      getFlightStatus(firstFlight.flightNumber, departureDateFormatted)
        .then(status => console.log(`Status of the flight ${firstFlight.flightNumber} on ${departureDateFormatted}: ${status}`));
    }
  })
  .catch(error => console.error(error));