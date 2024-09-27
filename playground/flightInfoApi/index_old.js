
const axios = require('axios');
const main = async () => {
  const options = {
    method: 'GET',
    url: process.env.FLIGHT_INFO_API_STATUS_URL,
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
      'X-RapidAPI-Key': process.env.FLIGHT_INFO_API_KEY,
      'X-RapidAPI-Host': process.env.FLIGHT_INFO_API_HOST,
    }
  };

  try {
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

    console.log(JSON.stringify({ data }))

  } catch (error) {
    console.error(error);
    console.error(error.code, JSON.stringify(error.response.data.errors));
  }
}

(async () => {
  await main();
})();
