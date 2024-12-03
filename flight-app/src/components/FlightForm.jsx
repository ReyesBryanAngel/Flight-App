import React, { useEffect, useState, useCallback } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Autocomplete,
    Menu,
    MenuItem,
    Typography,
    InputAdornment,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Paper 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { trips, cabinClass, sortBy } from '../static/selections';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import PersonIcon from '@mui/icons-material/Person';
import { searchAirPort, searchFlights } from '../services/rapidApiService';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import secureLocalStorage from "react-secure-storage";



const FlightForm = () => {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromLocations, setFromLocations] = useState([]); 
  const [toLocations, setToLocations] = useState([]); 
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [trip, setTrip] = useState('Round Trip');
  const [cabin, setCabin] = useState('economy');
  const [sort, setSort] = useState('');
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
    countryCode: "US"
  })

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
        const originSkyId = responseFrom?.data?.data?.map(arr => arr.skyId).shift();
        const originEntityId = responseFrom?.data?.data?.map(arr => arr.entityId).shift();
        setFlights((prevState) => ({
          ...prevState,
          originSkyId: originSkyId,
          originEntityId: originEntityId
        }))
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
        const destinationSkyId = responseTo?.data?.data?.map(arr => arr.skyId).shift();
        const destinationEntityId = responseTo?.data?.data?.map(arr => arr.entityId).shift();
        setFlights((prevState) => ({
          ...prevState,
          destinationSkyId: destinationSkyId,
          destinationEntityId: destinationEntityId
        }))

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
        )

        const flightsData = response?.data?.data?.itineraries?.map((itinerary) => {
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
                price
              }
            })
        }).flat();
        secureLocalStorage.setItem('flightsData', JSON.stringify(flightsData));
        setAvailableFlights(flightsData);
        flightsData?.length === 0 || !flightsData ? setSnackBar(true) : setSnackBar(false);
    } catch (error) {
        throw new Error(error.message);
    } finally {
      
      setSearchFlightLoading(false);
    }
  };

  useEffect(() => {
    const formattedDepartureDate = departureDate ? dayjs(departureDate).format("YYYY-MM-DD") : "";
    const formattedReturnDate = departureDate ? dayjs(departureDate).format("YYYY-MM-DD") : "";
    const savedFlights = JSON.parse(secureLocalStorage.getItem('flightsData')) || [];

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
      returnDate: formattedReturnDate
    }));

    setAvailableFlights(savedFlights);
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
    fetchLocationsTo
  ]);
  
  const increaseCount = (setter) => setter((prev) => prev + 1);
  const decreaseCount = (setter, person) => setter((prev) =>  
    prev > 0 && person !== 'Adult' ? prev - 1 : (person === 'Adult' && prev > 1) ? prev - 1 : prev
  );
  
  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const filteredFlights = availableFlights?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? []; 
 
  return (
    <Box className="p-4 border lg:w-3/4">
      <div className="flex flex-col gap-6 border p-6 bg-gray-100 rounded-md border">
      {snackBar && (
        <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={() => setSnackBar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
              <TextField {...params} variant="standard" placeholder="Select Cabins" />
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
  
        <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
        >
            <MenuItem disableRipple>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                    <Typography>
                        Adults<br /> 
                        <span sx={{ fontSize: '0.8rem', fontWeight: 'lighter' }}>12+ years</span> 
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Button variant="outlined" size="small" onClick={() => decreaseCount(setAdultCount, 'Adult')}>
                        -
                    </Button>
                    <Typography>{adultCount}</Typography>
                    <Button variant="outlined" size="small" onClick={() => increaseCount(setAdultCount)}>
                        +
                    </Button>
                    </Box>
                </Box>
            </MenuItem>
            <MenuItem disableRipple>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: "100%", gap:"3px" }}>
                    <Typography>
                        Children<br />
                        <span sx={{ fontSize: '0.8rem', fontWeight: 'lighter' }}>Aged 2-12</span> 
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Button variant="outlined" size="small" onClick={() => decreaseCount(setChildrenCount, 'Children')}>
                        -
                    </Button>
                    <Typography>{childrenCount}</Typography>
                    <Button variant="outlined" size="small" onClick={() => increaseCount(setChildrenCount)}>
                        +
                    </Button>
                    </Box>
                </Box>
            </MenuItem>
            <MenuItem disableRipple>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap:"10px" }}>
                    <Typography> 
                        Infants<br />
                        <span sx={{ fontSize: '0.8rem', fontWeight: 'lighter' }}>Under 2 years</span>
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button variant="outlined" size="small" onClick={() => decreaseCount(setInfantCount, 'Infant')}>
                            -
                        </Button>
                        <Typography>{infantCount}</Typography>
                        <Button variant="outlined" size="small" onClick={() => increaseCount(setInfantCount)}>
                            +
                        </Button>
                    </Box>
                </Box>
            </MenuItem>
        </Menu>

        <div className="flex flex-wrap lg:flex-nowrap">
          <div className={`w-full ${trip?.label === 'Round Trip' ? 'lg:w-2/5' : 'lg:w-3/5'}`}>
            <Autocomplete

              value={from}
              onChange={(event, newValue) => setFrom(newValue)}
              options={fromLocations}
              filterOptions={(x) => x}
              loading={fromLoading}
              noOptionsText={fromLoading ? "Loading..." : "Search Airports"}
              onInputChange={(event, newInputValue) => setFromQuery(newInputValue)}
              renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {fromLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
            />          
          </div>

          <Button onClick={handleSwap} variant="text">
            <SwapHorizIcon />
          </Button>

          <div className={`w-full ${trip?.label === 'Round Trip' ? 'lg:w-2/5' : 'lg:w-3/5'}`}>
            <Autocomplete
                value={to}
                onChange={(event, newValue) => setTo(newValue)}
                options={toLocations}
                filterOptions={(x) => x}
                loading={toLoading}
                noOptionsText={toLoading ? "Loading..." : "Search Airports"}
                onInputChange={(event, newInputValue) => setToQuery(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Where To"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {toLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className='flex w-full mt-2 lg:mt-0 lg:ml-2 gap-2 items-center justify-center'>
              <div className='w-full'>
                <DatePicker
                  // className={`${trip?.label === 'Round Trip' ? 'w-full' : ''}`}
                  className='w-full'
                  label="Departure Date"
                  value={departureDate}
                  onChange={(newValue) => setDepartureDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />  
              </div>
              {trip?.label === 'Round Trip' || trip === 'Round Trip' ? (
                <div className='w-full'>
                  <DatePicker
                    className="w-full"
                    label="Return Date"
                    value={returnDate}
                    onChange={(newValue) => setReturnDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
              </div>
              ) : ''}
            </div>
          </LocalizationProvider>
       </div>

        <Button 
          variant="outlined" 
          onClick={searchFlight} 
          endIcon={<SearchIcon />} 
          className='self-end' 
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
            <CircularProgress color='info' size={20} />
          ) : "Search Flights"}
        </Button>
      </div>

      <TableContainer component={Paper} className="mt-6">
        <Table className="table-auto border-collapse border border-gray-200 w-full">
          <TableBody>
            {filteredFlights?.map((flight, index) => {
              const departureAndArrival = `${dayjs(flight.departure).format('h:mm A')} - ${dayjs(flight.arrival).format('h:mm A')}`;
              const hours = Math.floor(flight.durationInMinutes / 60);
              const minutes = flight.durationInMinutes % 60;
              const travelDuration = `${hours} hr ${minutes} min`;
              const countryCodes = `${flight.originDisplayCode} - ${flight.destinationDisplayCode}`;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Box component="img" src={flight.marketingLogo} className="w-9 h-9" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <Typography>{departureAndArrival}</Typography>
                      <span>{flight.marketingName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <Typography>{travelDuration}</Typography>
                      <span>{countryCodes}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$ {flight.price}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {availableFlights?.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[15, 30, 45]}
          component="div"
          count={availableFlights?.length ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );  
};

export default FlightForm;
