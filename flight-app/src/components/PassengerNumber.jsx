import { Button, Box, Menu, MenuItem, Typography } from "@mui/material";
import PropTypes from "prop-types";

const PassengerNumber = ({
  menuAnchor,
  handleMenuClose,
  decreaseCount,
  setAdultCount,
  adultCount,
  increaseCount,
  setChildrenCount,
  childrenCount,
  setInfantCount,
  infantCount,
}) => {
  return (
    <div>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem disableRipple>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Typography>
              Adults
              <br />
              <span style={{ fontSize: "0.8rem", fontWeight: "lighter" }}>
                12+ years
              </span>
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => decreaseCount(setAdultCount, "Adult")}
              >
                -
              </Button>
              <Typography>{adultCount}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => increaseCount(setAdultCount)}
              >
                +
              </Button>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem disableRipple>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%", gap: "3px" }}
          >
            <Typography>
              Children
              <br />
              <span style={{ fontSize: "0.8rem", fontWeight: "lighter" }}>
                Aged 2-12
              </span>
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => decreaseCount(setChildrenCount, "Children")}
              >
                -
              </Button>
              <Typography>{childrenCount}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => increaseCount(setChildrenCount)}
              >
                +
              </Button>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem disableRipple>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ gap: "10px" }}
          >
            <Typography>
              Infants
              <br />
              <span style={{ fontSize: "0.8rem", fontWeight: "lighter" }}>
                Under 2 years
              </span>
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => decreaseCount(setInfantCount, "Infant")}
              >
                -
              </Button>
              <Typography>{infantCount}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => increaseCount(setInfantCount)}
              >
                +
              </Button>
            </Box>
          </Box>
        </MenuItem>
      </Menu>
    </div>
  );
};

PassengerNumber.propTypes = {
  menuAnchor: PropTypes.object,
  handleMenuClose: PropTypes.func.isRequired,
  decreaseCount: PropTypes.func.isRequired,
  setAdultCount: PropTypes.func.isRequired,
  adultCount: PropTypes.number.isRequired,
  increaseCount: PropTypes.func.isRequired,
  setChildrenCount: PropTypes.func.isRequired,
  childrenCount: PropTypes.number.isRequired,
  setInfantCount: PropTypes.func.isRequired,
  infantCount: PropTypes.number.isRequired,
};

export default PassengerNumber;
