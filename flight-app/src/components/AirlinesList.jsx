import dayjs from "dayjs";
import {
  Box,
  Typography,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TablePagination,
  Paper,
  Table,
} from "@mui/material";
import PropTypes from "prop-types";

const AirlinesList = ({
  availableFlights,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const filteredFlights = Array.isArray(availableFlights)
    ? availableFlights?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : [];

  return (
    <div>
      <TableContainer component={Paper} className="mt-6">
        <Table className="table-auto border-collapse border border-gray-200 w-full">
          <TableBody>
            {filteredFlights?.map((flight, index) => {
              const departureAndArrival = `${dayjs(flight.departure).format(
                "h:mm A"
              )} - ${dayjs(flight.arrival).format("h:mm A")}`;
              const hours = Math.floor(flight.durationInMinutes / 60);
              const minutes = flight.durationInMinutes % 60;
              const travelDuration = `${hours} hr ${minutes} min`;
              const countryCodes = `${flight.originDisplayCode} - ${flight.destinationDisplayCode}`;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Box
                      component="img"
                      src={flight.marketingLogo}
                      className="w-9 h-9"
                    />
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
    </div>
  );
};

AirlinesList.propTypes = {
  availableFlights: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
};

export default AirlinesList;
