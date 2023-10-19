// ** React Imports
import { forwardRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

// import { useForm, Controller, SubmitHandler, FieldValues } from 'react-hook-form'
// import NewSubsPopUp from './newSubsPopUp'
//import CardWorkoutMensual from './cardWorkouts'
import CardTrackingMensual from './cardTracking'
import TrackingPopUp from './trackingPopUp'

import format from 'date-fns/format'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Rating from '@mui/material/Rating'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Pagination from '@mui/material/Pagination'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'


// import { CardHeader } from '@mui/material'

import Dialog from '@mui/material/Dialog'

// import FormHelperText from '@mui/material/FormHelperText'
// import DialogActions from '@mui/material/DialogActions'
// import CircularProgress from '@mui/material/CircularProgress'
// import Divider from '@mui/material/Divider'

// import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// import CardContent from '@mui/material/CardContent'

import DialogTitle from '@mui/material/DialogTitle'

// import FormControl from '@mui/material/FormControl'
// import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

interface CustomInputProps {
  dates: Date[]
  label: string
  end: number | Date
  start: number | Date
  setDates?: (value: Date[]) => void
}

// import * as yup from 'yup'
// import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Components
// import CustomChip from 'src/@core/components/mui/chip'
// import CustomAvatar from 'src/@core/components/mui/avatar'


// ** Types
// import { ThemeColor } from 'src/@core/layouts/types'
// import { UsersType } from 'src/types/apps/userTypes'


// ** Utils Import
// import { getInitials } from 'src/@core/utils/get-initials'

interface Tracking {
  _id: string,
  planId: string,
  data: {
    _id: string
    date: Date,
    number: number
  }
}



const Tracking = () => {

  const session = useSession();
  const isTrainer = session.data?.user.role == 'Entrenador';

  const labels: { [index: string]: string } = {
    1: 'Malo',
    2: 'Bueno',
    3: 'Muy Bueno',
    4: 'Excelente',
  }
  const [hover, setHover] = useState<number>(-1)
  const [value, setValue] = useState<number | null | any>(2)
  const [nuevoRegistro, setNuevoRegistro] = useState<boolean>(false)
  const [titlePopUp, setTitlePopUp] = useState<string>('')
  const [trackingPopUp, setTrackingPopUp] = useState<boolean>(false)
  const [tracking, setTracking] = useState<Tracking>()
  const [currentPage, setCurrentPage] = useState<number>(1);
  const route = useRouter();
  const [dates, setDates] = useState<Date[]>([])
  const [endDateRange, setEndDateRange] = useState<DateType>(null)
  const [startDateRange, setStartDateRange] = useState<DateType>(null)



  console.log(tracking)
  const handlePopUpNuevoRegistro = () => {
    setNuevoRegistro(false)
  }
  const itemsPerPage = 6;
  const totalPages = Math.ceil(tracking?.data.length / itemsPerPage);
  console.log(totalPages)

  useEffect(() => {
    const fetchMyTracking = async () => {
      const id = route.query.id;

      try {
        const res = await fetch(
          `/api/tracking/?id=${id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.status == 200) {
          const data = await res.json();
          setTracking(data)
        }
        if (res.status == 404) {
          route.replace('/404');
        }
        if (res.status == 500) {
          route.replace('/500');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchMyTracking();
  }, []);

  const newTrackingRecord = async () => {
    const id = route.query.id;
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours())

    const requestBody = {
      id: id,
      data: {
        date: currentDate,
        number: value
      }
    };
    try {
      const res = await fetch('/api/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (res.status === 200) {
        const data = await res.json();
        setNuevoRegistro(false)
        setTracking(data)
        setTitlePopUp('Seguimiento registrado con éxito!')
        setTrackingPopUp(true)
      } else {
        setNuevoRegistro(false)
        setTitlePopUp('Error al guardar el seguimiento')
        setTrackingPopUp(true)
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };
  const CustomInput = forwardRef((props: CustomInputProps, ref) => {
    const startDate = props.start !== null ? format(props.start, 'dd/MM/yyyy') : ''
    const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

    const value = `${startDate}${endDate !== null ? endDate : ''}`
    props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
    const updatedProps = { ...props }
    delete updatedProps.setDates

    return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
  })

  const handleOnChangeRange = (dates: any) => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const filterByDateRange = (item: any) => {
    const itemDate = new Date(item.date);

    let adjustedEndDate = endDateRange;

    // Sumar un día a la fecha hasta si endDateRange no es nulo
    if (adjustedEndDate !== null) {
      adjustedEndDate = new Date(endDateRange as Date);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    }

    return (
      startDateRange === null ||
      adjustedEndDate === null ||
      (itemDate >= (startDateRange as Date) && itemDate < adjustedEndDate)
    );
  };

  return (
    <Grid >
      <Card sx={{ padding: '5', ml: 1, mr: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <Box ml={5}>
          <h2 style={{ fontSize: '24px', textTransform: 'uppercase' }}>Métricas</h2>
        </Box>

        {!isTrainer ? (
          <Button sx={{ mx: 4, my: 4 }} variant='contained' startIcon={<Icon icon='mdi:plus' />} onClick={() => setNuevoRegistro(true)}>
            Registro
          </Button>
        ) : null}


      </Card>


      {tracking ? (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, padding: 1 }}>
              <CardTrackingMensual tracking={tracking}></CardTrackingMensual>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' }, padding: 1, height: '485px' }}>
              <Card sx={{ height: '485px' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ textAlign: 'center' }}>Historial</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>Puntuación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tracking?.data
                        .filter(filterByDateRange)
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((trackingItem: any) => (
                          <TableRow key={trackingItem}>
                            <TableCell style={{ textAlign: 'center' }}>
                              {new Date(trackingItem.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell style={{ justifyContent: 'center' }}>
                              <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Rating readOnly value={trackingItem.number} max={4} name='read-only' />
                                <Typography sx={{ ml: 1 }}>{labels[trackingItem.number]}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>

                  </Table>
                </TableContainer>
                <Box className='demo-space-y' mt={2} alignItems={'center'} justifyContent='center' display={'flex'}>
                  <Pagination count={totalPages} color='primary' page={currentPage} onChange={(event, page) => setCurrentPage(page)} />
                </Box>

              </Card>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: '50px', mb: '20px' }}>
          <Typography variant='h6' sx={{ textAlign: 'center' }}>No tenés solicitudes de suscripciones por el momento.</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <DatePickerWrapper sx={{ '& .react-datepicker-wrapper': { width: '255px' } }}>
          <DatePicker
            isClearable
            selectsRange
            monthsShown={2}
            endDate={endDateRange}
            selected={startDateRange}
            startDate={startDateRange}
            shouldCloseOnSelect={false}
            id='date-range-picker-months'
            onChange={handleOnChangeRange}
            customInput={
              <CustomInput
                dates={dates}
                setDates={setDates}
                label='DD/MM/YYYY - DD/MM/YYYY'
                end={endDateRange as number | Date}
                start={startDateRange as number | Date}
              />
            }
          />
        </DatePickerWrapper>
      </Box>


      <Dialog
        open={nuevoRegistro}
        onClose={handlePopUpNuevoRegistro}
        aria-labelledby='user-view-plans'
        aria-describedby='user-view-plans-description'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
      >
        <DialogTitle
          id='user-view-plans'
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          Agregar un nuevo registro
        </DialogTitle>
        <Box display='column' justifyContent={'center'} >

          <Typography sx={{ textAlign: 'center', mt: '10px' }}>
            ¿Cómo estuvo el entrenamiento de hoy?
          </Typography>

          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
              flexWrap: ['wrap', 'nowrap'],
              pt: theme => `${theme.spacing(2)} !important`,
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                value={value}
                precision={1}
                name='hover-feedback'
                max={4}
                sx={{ mr: 4 }}
                onChange={(event, newValue) => setValue(newValue)}
                onChangeActive={(event, newHover) => setHover(newHover)}
              />
              {value !== null && <Typography>{labels[hover !== -1 ? hover : value]}</Typography>}
            </Box>
          </Box>

        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 5, mb: 5 }}>
          <Button variant='contained' onClick={() => newTrackingRecord()}>
            Aceptar
          </Button>

        </Box>
      </Dialog>
      <TrackingPopUp trackingPopUp={trackingPopUp} setTrackingPopUp={setTrackingPopUp} title={titlePopUp}></TrackingPopUp>
    </Grid >
  )

};


Tracking.acl = {
  action: 'manage',
  subject: 'tracking-page'
}


export default Tracking
