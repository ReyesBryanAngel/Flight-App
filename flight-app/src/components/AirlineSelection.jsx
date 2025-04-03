import {
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import PropTypes from "prop-types";

const AirlineSelection = ({
  trip,
  from,
  setFrom,
  departureAirlines,
  fromLoading,
  setDepartureQuery,
  handleSwap,
  to,
  setTo,
  destinationAirlines,
  toLoading,
  setDestinationQuery,
  departureDate,
  setDepartureDate,
  returnDate,
  setReturnDate,
}) => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap">
      <div
        className={`w-full ${
          trip?.label === "Round Trip" ? "lg:w-2/5" : "lg:w-3/5"
        }`}
      >
        <Autocomplete
          value={from}
          onChange={(event, newValue) => setFrom(newValue)}
          options={departureAirlines}
          filterOptions={(x) => x}
          loading={fromLoading}
          noOptionsText={fromLoading ? "Loading..." : "Search Airports"}
          onInputChange={(event, newInputValue) =>
            setDepartureQuery(newInputValue)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="From"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {fromLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
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

      <div
        className={`w-full ${
          trip?.label === "Round Trip" ? "lg:w-2/5" : "lg:w-3/5"
        }`}
      >
        <Autocomplete
          value={to}
          onChange={(event, newValue) => setTo(newValue)}
          options={destinationAirlines}
          filterOptions={(x) => x}
          loading={toLoading}
          noOptionsText={toLoading ? "Loading..." : "Search Airports"}
          onInputChange={(event, newInputValue) =>
            setDestinationQuery(newInputValue)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Where To"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {toLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="flex w-full mt-2 lg:mt-0 lg:ml-2 gap-2 items-center justify-center">
          <div className="w-full">
            <DatePicker
              className="w-full"
              label="Departure Date"
              value={departureDate}
              onChange={(newValue) => setDepartureDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
          {trip?.label === "Round Trip" || trip === "Round Trip" ? (
            <div className="w-full">
              <DatePicker
                className="w-full"
                label="Return Date"
                value={returnDate}
                onChange={(newValue) => setReturnDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </LocalizationProvider>
    </div>
  );
};

AirlineSelection.propTypes = {
  trip: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
  setFrom: PropTypes.func.isRequired,
  departureAirlines: PropTypes.array.isRequired,
  fromLoading: PropTypes.bool.isRequired,
  setDepartureQuery: PropTypes.func.isRequired,
  handleSwap: PropTypes.func.isRequired,
  to: PropTypes.string.isRequired,
  setTo: PropTypes.func.isRequired,
  destinationAirlines: PropTypes.array.isRequired,
  toLoading: PropTypes.bool.isRequired,
  setDestinationQuery: PropTypes.func.isRequired,
  departureDate: PropTypes.object,
  setDepartureDate: PropTypes.func,
  returnDate: PropTypes.object,
  setReturnDate: PropTypes.func,
};

export default AirlineSelection;
