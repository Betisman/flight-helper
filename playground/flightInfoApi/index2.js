const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

// Configuración de la API Flight-Info
const FLIGHT_INFO_API_KEY = process.env.FLIGHT_INFO_API_KEY;
const FLIGHT_INFO_API_HOST = process.env.FLIGHT_INFO_API_HOST;
const IS_TEST = process.env.IS_TEST || true;

const main = async () => {
  const defaultOptions = {
    method: 'GET',
    url: 'https://flight-info-api.p.rapidapi.com/status',
    params: {
      version: 'v2',
      CodeType: 'IATA',
      ServiceType: 'Passenger',
    },
    headers: {
      'X-RapidAPI-Key': FLIGHT_INFO_API_KEY,
      'X-RapidAPI-Host': FLIGHT_INFO_API_HOST
    }
  };

  const extendParams = ({ method, url, params, headers }) => {
    return {
      method: method || defaultOptions.method,
      url: url || defaultOptions.url,
      params: { ...defaultOptions.params, ...params },
      headers: headers || defaultOptions.headers
    }
  };

  const query = async (options) => {
    const extendedOptions = extendParams(options);
    let response = await axios.request(options);

    const data = response.data.data;
    let paging = response.data.paging;

    let end = IS_TEST || response.data.paging.next === '';
    while (!end) {
      options.params.After = paging.next;
      response = await axios.request(options);
      data.push(...response.data.data);
      end = response.data.paging.next === '';
      paging = response.data.paging;
    }

    console.log(JSON.stringify({ data }))
    return data;
  };

  const options = {
    method: 'GET',
    url: 'https://flight-info-api.p.rapidapi.com/status',
    params: {
      version: 'v2',
      // ArrivalDateTime: '2024-02-20T22:00/2024-02-22T12:00',
      // ArrivalAirport: 'ZAG',
      DepartureAirport: 'VLC',
      DepartureDateTime: '2024-07-12T16:00/2024-07-13T23:59',
      CodeType: 'IATA',
      ServiceType: 'Passenger',
      // After: '202311300725-1695126341617000000-ee170b5b912883d6727d0aabab5d57eb06ead07855096ba1434e901a94247163',
    },
    headers: {
      'X-RapidAPI-Key': FLIGHT_INFO_API_KEY,
      'X-RapidAPI-Host': FLIGHT_INFO_API_HOST
    }
  };

  try {
    console.log('querying arrivals', extendParams({
      params: {
        ArrivalAirport: 'KIV',
        ArrivalDateTime: '2024-12-11T20:00/2024-12-12T10:00',
      }
    }))
    const arrivals = await query(extendParams({
      params: {
        ...options.params,
        ArrivalAirport: 'KIV',
        ArrivalDateTime: '2024-12-11T20:00/2024-12-12T10:00',
      }
    }));
    console.log(arrivals)

  } catch (error) {
    console.error(error);
    console.error(error.code, JSON.stringify(error.response.data.errors));
  }
}

(async () => {
  await main();
})();
