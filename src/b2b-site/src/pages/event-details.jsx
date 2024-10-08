/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Modal,
  Box,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { CartContext } from 'src/context/CartContext';
import { getCallable, storage } from 'src/utils/firebase';
import ImageComponent from 'src/components/firebase-image';
import { getDownloadURL, ref } from 'firebase/storage';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TransportationOption({ option, setSelectedTransportation, handleNext }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storageRef = ref(storage, option.bus.image_url);
        const url = await getDownloadURL(storageRef);
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [option.bus.image_url]);

  const [logoURL, setLogoURL] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storageRef = ref(storage, option.vendor.logo_url);
        const url = await getDownloadURL(storageRef);
        setLogoURL(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [option.vendor.logo_url]);

  return (
    <Grid item xs={12} sm={6} key={option.id}>
      <Card
        onClick={() => {
          setSelectedTransportation(option);
          handleNext();
        }}
      >
        <CardMedia component="img" height="140" image={imageUrl} alt={option.food} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid white',
                mr: 2,
              }}
            >
              <ImageComponent filePath={logoURL} style={{ width: '100%', height: 'auto' }} />
            </Box>
            <Typography variant="body1">{option.vendor.name}</Typography>
          </Box>
          <Typography variant="h6">Bus Model: {option.bus.model}</Typography>
          <Typography variant="body1">Origin: {option.origin}</Typography>
          <Typography variant="body1">Price: {option.price} EUR</Typography>
          <Typography variant="body1">
            Departure Date: {new Date(option.departure_date._seconds * 1000).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

TransportationOption.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bus: PropTypes.shape({
      image_url: PropTypes.string.isRequired,
      model: PropTypes.string.isRequired,
    }).isRequired,
    vendor: PropTypes.shape({
      logo_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    origin: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    departure_date: PropTypes.shape({
      _seconds: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  setSelectedTransportation: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

function FoodOption({ option, setSelectedFood, handleNext }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storageRef = ref(storage, option.image_url);
        const url = await getDownloadURL(storageRef);
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [option.image_url]);

  const [logoURL, setLogoURL] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storageRef = ref(storage, option.vendor.logo_url);
        const url = await getDownloadURL(storageRef);
        setLogoURL(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [option.vendor.logo_url]);

  return (
    <Grid item xs={12} sm={6} key={option.id}>
      <Card
        onClick={() => {
          setSelectedFood(option);
          handleNext();
        }}
      >
        <CardMedia component="img" height="140" image={imageUrl} alt={option.food} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid white',
                mr: 2,
              }}
            >
              <ImageComponent filePath={logoURL} style={{ width: '100%', height: 'auto' }} />
            </Box>
            <Typography variant="body1">{option.vendor.name}</Typography>
          </Box>
          <Typography variant="h6">Food: {option.food}</Typography>
          <Typography variant="h6">Drink: {option.drink}</Typography>
          <Typography variant="body1">Description: {option.description}</Typography>
          <Typography variant="body1">Price: {option.price} EUR</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

FoodOption.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    vendor: PropTypes.shape({
      logo_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    food: PropTypes.string.isRequired,
    drink: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  setSelectedFood: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { event } = location.state || {};
  const { addToCart } = useContext(CartContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedTransportation, setSelectedTransportation] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [transportationOptions, setTransportationOptions] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [eventImageUrl, setEventImageUrl] = useState('');
  const [eventLogoUrl, setEventLogoUrl] = useState('');

  useEffect(() => {
    if (event && event.image_url) {
      const fetchImage = async () => {
        try {
          const storageRef = ref(storage, event.image_url);
          const url = await getDownloadURL(storageRef);
          setEventImageUrl(url);
        } catch (error) {
          console.error('Error fetching event image:', error);
        }
      };
      fetchImage();
    }

    if (event && event.vendor && event.vendor.logo_url) {
      const fetchLogo = async () => {
        try {
          const storageRef = ref(storage, event.vendor.logo_url);
          const url = await getDownloadURL(storageRef);
          setEventLogoUrl(url);
        } catch (error) {
          console.error('Error fetching vendor logo:', error);
        }
      };
      fetchLogo();
    }
  }, [event]);

  useEffect(() => {
    if (modalOpen && step === 1) {
      fetchTransportationOptions();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (step === 2) {
      fetchFoodOptions();
    }
  }, [step]);

  if (!event) {
    return <Typography variant="h4">Event not found</Typography>;
  }

  const fetchTransportationOptions = async () => {
    const getTransportation = getCallable('endpoints-getTransportation');
    try {
      const result = await getTransportation({ event: event, offset: 0, limit: 10 });
      if (result.data) {
        setTransportationOptions(result.data);
      } else {
        console.error('Error fetching transportation options:', result.data.error);
      }
    } catch (error) {
      console.error('Error fetching transportation options:', error);
    }
  };

  const fetchFoodOptions = async () => {
    const getFood = getCallable('endpoints-getFood');
    try {
      const result = await getFood({ offset: 0, limit: 10 });
      if (result.data) {
        setFoodOptions(result.data);
      } else {
        console.error('Error fetching food options:', result.data.error);
      }
    } catch (error) {
      console.error('Error fetching food options:', error);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setStep(1);
    setSelectedSeat(null);
    setSelectedTransportation(null);
    setSelectedFood(null);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const addToCartHandler = async () => {
    try {
      const reserve = getCallable('endpoints-reserve');

      const response = (
        await reserve({
          event: event,
          transportation: selectedTransportation,
          food: selectedFood,
        })
      ).data;

      console.log('Reservation Response:', response);

      if (!response.result.valid) {
        setSnackbarMessage('Error adding to cart, refresh and try again');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (response.result.message.startsWith('WARNING! Price changed')) {
        setSnackbarMessage(response.result.message);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Package added to cart successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }

      const packageItem = {
        id: response.id,
        event: event,
        seat: response.seat,
        ticket: response.ticket,
        meal: response.meal,
        transportation: selectedTransportation,
        food: selectedFood,
        total: selectedTransportation.price + selectedFood.price + event.price,
      };

      addToCart(packageItem);
      closeModal();
    } catch (error) {
      console.error('Error reserving:', error);
      setSnackbarMessage('Error adding to cart, refresh and try again');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const renderTransportationOptions = () => (
    <Grid container spacing={2}>
      {transportationOptions.map((opt) => (
        <TransportationOption
          key={opt.id}
          option={opt}
          setSelectedTransportation={setSelectedTransportation}
          handleNext={handleNext}
        />
      ))}
    </Grid>
  );

  const renderFoodOptions = () => (
    <Grid container spacing={2}>
      {foodOptions.map((opt) => (
        <FoodOption
          key={opt.id}
          option={opt}
          setSelectedFood={setSelectedFood}
          handleNext={handleNext}
        />
      ))}
    </Grid>
  );

  const renderModalContent = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <Typography variant="h6">Step 2: Select Transportation</Typography>
            {renderTransportationOptions()}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6">Step 3: Select Food</Typography>
            {renderFoodOptions()}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6">Package Summary</Typography>
            <Typography>Event: {event.name}</Typography>
            <Typography>Ticket: {event.price} EUR</Typography>
            <Typography>
              Transportation: {selectedTransportation?.origin} - {selectedTransportation?.price} EUR
            </Typography>
            <Typography>
              Food: {selectedFood?.food} - {selectedFood?.price} EUR
            </Typography>
            <Typography>
              Total:{' '}
              {(selectedTransportation?.price || 0) +
                (selectedFood?.price || 0) +
                (event.price || 0)}{' '}
              EUR
            </Typography>
            <Button onClick={addToCartHandler} disabled={!selectedTransportation || !selectedFood}>
              Add to Cart
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Card>
        <CardMedia component="img" height="300" image={eventImageUrl} alt={event.name} />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid white',
          }}
        >
          <ImageComponent filePath={eventLogoUrl} style={{ width: '100%', height: 'auto' }} />
        </Box>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {event.name}
          </Typography>
          <Typography variant="body1" paragraph>
            Genre: {event.genre}
          </Typography>
          <Typography variant="body1" paragraph>
            Date:{' '}
            {event.date
              ? new Date(event.date._seconds * 1000).toLocaleDateString()
              : 'Date not available'}
          </Typography>
          <Typography variant="body1" paragraph>
            Venue: {event.venue.name}
          </Typography>
          <Typography variant="body1" paragraph>
            Address: {event.venue.location}
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Price: {event.price} EUR
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid white',
                mr: 2,
              }}
            >
              <ImageComponent
                filePath={event.vendor.logo_url}
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
            <Typography variant="body1">{event.vendor.name}</Typography>
          </Box>
          <Button onClick={openModal} variant="contained" size="large" sx={{ mt: 2, ml: 2 }}>
            Get Package Deal
          </Button>
        </CardContent>
      </Card>
      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            p: 4,
            backgroundColor: 'white',
            m: 'auto',
            mt: 10,
            borderRadius: 2,
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {renderModalContent()}
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={step === 3}>
              Next
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
