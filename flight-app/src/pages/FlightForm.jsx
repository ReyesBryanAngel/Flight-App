import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { trips, cabinClass, sortBy } from "../static/selections";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import PersonIcon from "@mui/icons-material/Person";
import { searchAirPort, searchFlights } from "../services/rapidApiService";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import secureLocalStorage from "react-secure-storage";
import AirlinesList from "../components/AirlinesList";
import AirlineSelection from "../components/AirlineSelection";
import PassengerNumber from "../components/PassengerNumber";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const FlightForm = () => {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [trip, setTrip] = useState("Round Trip");
  const [cabin, setCabin] = useState("economy");
  const [sort, setSort] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [searchFlighLoading, setSearchFlightLoading] = useState(false);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [snackBar, setSnackBar] = useState(false);
  const [flights, setFlights] = useState({
    originSkyId: "",
    destinationSkyId: "",
    originEntityId: "",
    destinationEntityId: "",
    date: "",
    returnDate: "",
    cabin: "",
    adults: "",
    childrens: "",
    infants: "",
    sortBy: "",
    currency: "USD",
    market: "en-US",
    countryCode: "US",
  });

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchLocationsFrom = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return;

      setFromLoading(true);
      try {
        const responseFrom = await searchAirPort(value);
        const originSkyId = responseFrom?.data?.data
          ?.map((arr) => arr.skyId)
          .shift();
        const originEntityId = responseFrom?.data?.data
          ?.map((arr) => arr.entityId)
          .shift();
        setFlights((prevState) => ({
          ...prevState,
          originSkyId: originSkyId,
          originEntityId: originEntityId,
        }));
        const data = responseFrom?.data?.data?.map(
          (arr) => arr.navigation?.localizedName
        );

        setFromLocations(data || []);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setFromLoading(false);
      }
    }, 1000),
    []
  );

  const fetchLocationsTo = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return;

      setToLoading(true);
      try {
        const responseTo = await searchAirPort(value);
        const data = responseTo?.data?.data?.map(
          (arr) => arr.navigation?.localizedName
        );
        const destinationSkyId = responseTo?.data?.data
          ?.map((arr) => arr.skyId)
          .shift();
        const destinationEntityId = responseTo?.data?.data
          ?.map((arr) => arr.entityId)
          .shift();
        setFlights((prevState) => ({
          ...prevState,
          destinationSkyId: destinationSkyId,
          destinationEntityId: destinationEntityId,
        }));

        setToLocations(data || []);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setToLoading(false);
      }
    }, 1000),
    []
  );

  const searchFlight = async () => {
    setSearchFlightLoading(true);
    try {
      const response = await searchFlights(
        flights.originSkyId,
        flights.destinationSkyId,
        flights.originEntityId,
        flights.destinationEntityId,
        flights.date,
        flights.returnDate,
        flights.cabin,
        flights.adults,
        flights.sortBy,
        flights.currency,
        flights.market,
        flights.countryCode
      );

      const flightsData = response?.data?.data?.itineraries
        ?.map((itinerary) => {
          if (!itinerary && !Array.isArray(itinerary.legs)) return itinerary;
          return itinerary?.legs?.map((leg) => {
            const originName = leg?.origin?.name || "";
            const originDisplayCode = leg?.origin?.displayCode || "";
            const destinationName = leg?.destination?.name || "";
            const destinationDisplayCode = leg?.destination?.displayCode || "";
            const departure = leg?.departure || "";
            const arrival = leg?.arrival || "";
            const durationInMinutes = leg?.durationInMinutes || 0;
            const firstCarrier = leg.carriers?.marketing?.[0] || {};
            const marketingLogo = firstCarrier.logoUrl || "";
            const marketingName = firstCarrier.name || "";
            const price = itinerary?.price?.raw;

            return {
              originName,
              originDisplayCode,
              destinationName,
              destinationDisplayCode,
              departure,
              arrival,
              durationInMinutes,
              marketingLogo,
              marketingName,
              price,
            };
          });
        })
        .flat();
      secureLocalStorage.setItem("flightsData", JSON.stringify(flightsData));
      setAvailableFlights(flightsData);
      flightsData?.length === 0 || !flightsData
        ? setSnackBar(true)
        : setSnackBar(false);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setSearchFlightLoading(false);
    }
  };

  useEffect(() => {
    const formattedDepartureDate = departureDate
      ? dayjs(departureDate).format("YYYY-MM-DD")
      : "";
    const formattedReturnDate = departureDate
      ? dayjs(departureDate).format("YYYY-MM-DD")
      : "";
    const savedFlights =
      JSON.parse(secureLocalStorage.getItem("flightsData")) || [];

    setQuantity(adultCount + childrenCount + infantCount);
    if (fromQuery.trim()) fetchLocationsFrom(fromQuery);
    if (toQuery.trim()) fetchLocationsTo(toQuery);
    setFlights((prevState) => ({
      ...prevState,
      cabin: !cabin?.value ? cabin : cabin?.value,
      adults: adultCount,
      childrens: childrenCount,
      infants: infantCount,
      date: formattedDepartureDate,
      sortBy: !sort?.value ? sort : sort?.value,
      returnDate: formattedReturnDate,
    }));

    setAvailableFlights(savedFlights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    departureDate,
    cabin,
    adultCount,
    childrenCount,
    infantCount,
    trips,
    fromQuery,
    toQuery,
    fetchLocationsFrom,
    fetchLocationsTo,
  ]);

  const increaseCount = (setter) => setter((prev) => prev + 1);
  const decreaseCount = (setter, person) =>
    setter((prev) =>
      prev > 0 && person !== "Adult"
        ? prev - 1
        : person === "Adult" && prev > 1
        ? prev - 1
        : prev
    );

  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <Box className="p-4 lg:w-3/4 flex flex-col gap-2">
      <div className="flex gap-2">
        <Typography variant="h4" color="primary">
          Flights
        </Typography>
        <FlightTakeoffIcon color="primary" />
      </div>
      <div className="flex flex-col gap-6 border p-6 bg-gray-100 rounded-md border">
        {snackBar && (
          <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={() => setSnackBar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MuiAlert
              elevation={6}
              variant="standard"
              onClose={() => setSnackBar(false)}
              severity="alert"
            >
              No Available Flights for selected place at the moment.
            </MuiAlert>
          </Snackbar>
        )}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between">
          <Button
            startIcon={<PersonIcon />}
            onClick={menuAnchor ? handleMenuClose : handleMenuOpen}
            variant="text"
            endIcon={menuAnchor ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          >
            {quantity}
          </Button>
          <Autocomplete
            className="w-full md:w-1/4"
            value={trip}
            onChange={(event, newValue) => setTrip(newValue)}
            options={trips}
            getOptionLabel={(option) => option.label ?? "Round Trip"}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Select a trip"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      {trip?.label === "One Way" ? (
                        <ArrowRightAltIcon />
                      ) : trip?.label === "Round Trip" ? (
                        <SwapHorizIcon />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Autocomplete
            className="w-full md:w-1/4"
            value={cabin}
            onChange={(event, newValue) => setCabin(newValue)}
            options={cabinClass}
            getOptionLabel={(option) => option.label ?? "Economy"}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Select Cabins"
              />
            )}
          />
          <Autocomplete
            className="w-full md:w-1/4"
            value={sort}
            onChange={(event, newValue) => setSort(newValue)}
            options={sortBy}
            renderInput={(params) => (
              <TextField {...params} variant="standard" placeholder="Sort By" />
            )}
          />
        </div>
        <PassengerNumber
          menuAnchor={menuAnchor}
          handleMenuClose={handleMenuClose}
          decreaseCount={decreaseCount}
          setAdultCount={setAdultCount}
          adultCount={adultCount}
          increaseCount={increaseCount}
          setChildrenCount={setChildrenCount}
          childrenCount={childrenCount}
          setInfantCount={setInfantCount}
          infantCount={infantCount}
        />
        <AirlineSelection
          trip={trip}
          from={from}
          setFrom={setFrom}
          fromLocations={fromLocations}
          fromLoading={fromLoading}
          setFromQuery={setFromQuery}
          handleSwap={handleSwap}
          to={to}
          setTo={setTo}
          toLocations={toLocations}
          toLoading={toLoading}
          setToQuery={setToQuery}
          departureDate={departureDate}
          setDepartureDate={setDepartureDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
        />
        <Button
          variant="outlined"
          onClick={searchFlight}
          endIcon={<SearchIcon />}
          className="self-end"
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            width: "170px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {searchFlighLoading ? (
            <CircularProgress color="info" size={20} />
          ) : (
            "Search Flights"
          )}
        </Button>
      </div>
      <AirlinesList
        availableFlights={availableFlights}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default FlightForm;
