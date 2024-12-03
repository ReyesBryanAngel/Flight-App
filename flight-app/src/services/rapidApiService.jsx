import axios from 'axios';

    export const searchAirPort = async (query) => {
        return await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/flights/searchAirport`, {
            params: {
                query: query,
                locale: 'en-US'
            },
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
                'x-rapidapi-host': import.meta.env.VITE_RAPID_API_HOST
            }
        });
    };

    export const searchFlights = async (
        originSkyId,
        destinationSkyId,
        originEntityId,
        destinationEntityId,
        date,
        returnDate,
        cabin,
        adults,
        sortBy,
        currency,
        market,
        countryCode
    ) => {
        return await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/flights/searchFlights`, {
            params: {
                originSkyId: originSkyId,
                destinationSkyId: destinationSkyId,
                originEntityId: originEntityId,
                destinationEntityId: destinationEntityId,
                date: date,
                returnDate: returnDate,
                cabin: cabin,
                adults: adults,
                sortBy: sortBy,
                currency: currency,
                market: market,
                countryCode: countryCode
            },
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
                'x-rapidapi-host': import.meta.env.VITE_RAPID_API_HOST
            }
        })
    }
