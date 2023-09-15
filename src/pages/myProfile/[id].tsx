// ** React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useForm, Controller, SubmitHandler, FieldValues } from 'react-hook-form'
import NewSubsPopUp from './newSubsPopUp'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormHelperText from '@mui/material/FormHelperText'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import CardContent from '@mui/material/CardContent'

import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'


// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { UsersType } from 'src/types/apps/userTypes'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'


interface ColorsType {
  [key: string]: ThemeColor
}

interface Subscription {
  _id: string
  name: string
  amount: string
  description: string
  deleted: boolean
}

const data: UsersType = {
  _id: 1,
  role: 'admin',
  status: 'pending',
  username: 'gslixby0',
  avatarColor: 'primary',
  country: 'El Salvador',
  company: 'Yotz PVT LTD',
  contact: '(479) 232-9151',
  currentPlan: 'enterprise',
  fullName: 'Daisy Patterson',
  email: 'gslixby0@abc.net.au',
  avatar: '/images/avatars/1.png',
  name: '',
  phone: 0,
  gender: '',
  discipline: ''
}

const statusColors: ColorsType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

const MyProfile = () => {
  interface FormData {
    _id: number | string
    name: string
    amount: string
    description: string
  }

  const schema = yup.object().shape({
    description: yup.string().required("Descripción es un campo obligatorio").max(350, "Debe tener 350 caracteres máximo").min(4, "Debe tener 4 caracteres minimo"),
  })

  const updateSchema = yup.object().shape({
    name: yup.string().required("Nombre es un campo obligatorio").max(20, "Debe tener 20 caracteres máximo").min(4, "Debe tener 4 caracteres minimo"),
    amount: yup.string().required("Precio es un campo numérico y obligatorio"),
    description: yup.string().required("Descripción es un campo obligatorio").max(350, "Debe tener 350 caracteres máximo").min(4, "Debe tener 4 caracteres minimo"),
  })


  // ** States
  const [openPlans, setOpenPlans] = useState<boolean>(false)
  const [openDeleteSubs, setOpenDeleteSubs] = useState<boolean>(false)
  const [deletedSubs, setDeletedSubs] = useState<FormData>()
  const [newSubsPopUpOpen, setNewSubsPopUpOpen] = useState<boolean>(false)
  const [sendSubsRequest, setSendSubsRequest] = useState<FormData>()
  const [editSubs, setEditSubscription] = useState<FormData>()
  const [popUp, setPopUp] = useState<boolean>(false)
  const [titlePopUp, setTitlePopUp] = useState<string>()
  const [textPopUp, setTextPopUp] = useState<string>('Refresque la pagina para ver los cambios')
  const [openSubscriptionRequest, setOpenSuscriptionRequest] = useState<boolean>(false)
  const { data: session } = useSession();
  const [users, setUsers] = useState<UsersType>([]); //Users es un array del tipo UsersType[]. Podria tambien solamente ser del tipo []
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const route = useRouter();
  const closePopUp = () => setPopUp(false)

  // const requestSend = () => {
  //   setTitlePopUp('Solicitud enviada!')
  //   setTextPopUp('')
  //   setPopUp(true)
  //   hanldeSubscriptionRequest()
  // }
  const handlePlansClose = () => setOpenPlans(false)
  const handleEditClick = (sub: any) => {
    setValue("name", sub.name)
    setValue("amount", sub.amount)
    setValue("description", sub.description)
    setEditSubscription(sub);
    setOpenPlans(true);
  };

  const hanldeSubscriptionRequest = () => setOpenSuscriptionRequest(false)
  const hadleCloseDeleteSubscriptionPopUp = () => setOpenDeleteSubs(false)
  const handleOpenDeleteSubscriptionPopUp = (sub: any) => {
    setDeletedSubs(sub)
    setOpenDeleteSubs(true)
  }
  const handleSendSubsRequest = (sub: any) => {
    setSendSubsRequest(sub)
    setOpenSuscriptionRequest(true)
  }

  const disabled = subs.length >= 3;
  const isTrainerSession = route.query.id === session?.user._id

  // ** React-Hook-Form
  const {
    control,
    handleSubmit: sendSubsRequestHandleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      description: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const {
    control: updateControl,
    handleSubmit: updateHandleSubmit,
    setValue,
    formState: { errors: updateErrors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      amount: '',
      description: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(updateSchema),
  });


  useEffect(() => {
    const fetchProfile = async () => {
      const id = route.query.id       //Funcion asincrona que hace la llamada a la API de students.
      try {
        // ** Login API Call to match the user credentials and receive user data in response along with his role
        const res = await fetch('/api/myProfile/?id=' + id, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        if (res.status == 200) {
          const data = await res.json();
          setUsers(data.user);
          setSubs(data.subs);
          setIsLoading(true);
        }
        if (res.status == 404) {
          route.replace('/404')
        }
        if (res.status == 500) {
          route.replace('/500')
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchProfile(); //Se llama a la función fetchAlumnoUsers dentro de useEffect. Esto asegura que la llamada a la API se realice solo una vez
  }, []);

  const updateSubscription: SubmitHandler<FieldValues> = async (data) => {
    const subsId = editSubs?._id || deletedSubs?._id
    let name, amount, description;
    let deleted;

    if (openPlans) {
      name = data.name
      amount = data.amount
      description = data.description;
      deleted = false;
    }
    else {
      name = deletedSubs?.name
      amount = deletedSubs?.amount
      description = deletedSubs?.description;
      deleted = true;
    }

    try {
      const res = await fetch('/api/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subsId, name, amount, description, deleted })
      })
      if (res.status == 200) {
        if (openPlans) {
          handlePlansClose()
          setTitlePopUp('Suscripción editada!')
          setPopUp(true)
          if (subsId) {

            const editedSubscription = { _id: subsId?.toString(), name: name, amount: amount, description: description, deleted: deleted };
            setSubs((prevSubs) => prevSubs.map((sub) => (sub._id === editedSubscription._id ? editedSubscription : sub)));
          }

        }
        else {
          hadleCloseDeleteSubscriptionPopUp()
          setTitlePopUp('Suscripción borrada!')
          setPopUp(true)
          setSubs((prevSubs) => prevSubs.filter((sub) => sub._id !== subsId));
        }
      }
      else {
        if (res.status == 409) {
          console.log('error 409')
        }
        if (res.status == 400) {
          route.replace('/404')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const sendSubscriptionRequest: SubmitHandler<FieldValues> = async (data) => {
    const { description } = data;
    const status = "pendiente"
    const trainerId = route.query.id
    const studentId = session?.user._id
    const subscriptionId = sendSubsRequest?._id
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3)
    const formattedDate = currentDate.toISOString();
    try {
      const res = await fetch('/api/subsRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, status, trainerId, studentId, subscriptionId, date: formattedDate })
      })
      if (res.status == 200) {
        hanldeSubscriptionRequest()
        setTitlePopUp('Solicitud enviada!')
        setTextPopUp('')
        setPopUp(true)
      }
      if (res.status == 400) {
        route.replace('/404')
      }

    } catch (error) {
      console.log(error)
    }
  }


  if (data && isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} sx={{ height: '550px' }}>
          <Card>
            <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              {data.avatar ? (
                <CustomAvatar
                  src={data.avatar}
                  variant='rounded'
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4 }}
                />
              ) : (
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={data.avatarColor as ThemeColor}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                >
                  {getInitials(data.fullName)}
                </CustomAvatar>
              )}
              <Typography variant='h6' sx={{ mb: 2 }}>
                {users.name}
              </Typography>

              <CustomChip
                skin='light'
                size='small'

                label={users.discipline}

                color={statusColors[data.status]}
                sx={{
                  height: 20,
                  fontWeight: 600,
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize',
                  '& .MuiChip-label': { mt: -0.25 }
                }}
              />
            </CardContent>
            <CardContent>
              <Typography variant='h6'>Información del profesional</Typography>
              <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
              <Box sx={{ pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>Nombre:</Typography>
                  <Typography variant='body2'>{users.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>Email:</Typography>
                  <Typography variant='body2'>{users.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Teléfono:</Typography>
                  <Typography variant='body2'>{users.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Género:</Typography>
                  <Typography variant='body2'>{users.gender}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>País:</Typography>
                  <Typography variant='body2'>{users.country}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8} sx={{ height: '550px' }}>
          <Grid container spacing={2} sx={{ height: '480px' }}>
            {subs.map((sub: Subscription, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ height: '450px', mb: '20px' }}>
                <Card sx={{ boxShadow: 'none', height: '450px', border: theme => `2px solid ${theme.palette.primary.main}` }}>
                  <CardContent
                    sx={{ flexWrap: 'wrap', pb: '0 !important', justifyContent: 'space-between', }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h5' sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                        {sub.name}

                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
                        <Typography variant='body2' sx={{ mt: 1.6, fontWeight: 600, alignSelf: 'flex-start' }}>
                          $
                        </Typography>
                        <Typography variant='h3' sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.17 }}>
                          {sub.amount}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 1.6, fontWeight: 600, alignSelf: 'flex-end' }}>
                          /mensual
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardContent>
                    <Box sx={{ mt: 4, mb: 5, height: '200px' }}>
                      <Box
                        sx={{ display: 'flex', mb: 2.5, alignItems: 'center', '& svg': { mr: 2, color: 'text.secondary' } }}
                      >

                        <Typography component='span' sx={{ fontSize: '0.875rem' }}>
                          {sub.description}
                        </Typography>
                      </Box>
                    </Box>

                  </CardContent>
                  <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {isTrainerSession ? (
                        <Box sx={{ display: 'flex', gap: '10px' }}>

                          <Button variant='contained' title='Editar' sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 'auto' }} onClick={() => handleEditClick(sub)}>
                            <Icon icon='mdi:pencil' />
                          </Button>
                          <Button variant='contained' color='error' title='Borrar' sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 'auto' }} onClick={() => handleOpenDeleteSubscriptionPopUp(sub)} >
                            <Icon icon='mdi:delete' />
                          </Button>
                        </Box>
                      ) :

                        <Button variant='contained' title='Enviar' sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 'auto' }} onClick={() => handleSendSubsRequest(sub)}>
                          <Icon icon='mdi:send' />
                        </Button>
                      }
                    </Box>
                  </CardContent>

                  <Dialog
                    open={openPlans}
                    onClose={handlePlansClose}
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
                      Editar suscripción
                    </DialogTitle>
                    <DialogContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: ['wrap', 'nowrap'],
                        pt: theme => `${theme.spacing(2)} !important`,
                        pb: theme => `${theme.spacing(8)} !important`,
                        px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
                      }}
                    >
                      <form noValidate autoComplete='off' onSubmit={updateHandleSubmit(updateSubscription)}>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                          <Controller
                            name='name'
                            control={updateControl}
                            rules={{ required: true }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextField

                                label='Nombre'
                                name='name'
                                value={value}
                                onBlur={onBlur}
                                onChange={onChange}
                                error={Boolean(updateErrors.name)}
                              />
                            )}
                          />
                          {updateErrors.name && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {updateErrors.name.message}
                            </FormHelperText>
                          )}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                          <Controller
                            name='amount'
                            control={updateControl}
                            rules={{ required: true }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextField
                                label='Precio'
                                name='amount'
                                type='number'
                                value={value}
                                onBlur={onBlur}
                                onChange={onChange}
                                error={Boolean(updateErrors.amount)}
                              />
                            )}
                          />
                          {updateErrors.amount && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {updateErrors.amount.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                          <Controller
                            name='description'
                            control={updateControl}
                            rules={{ required: true }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextField
                                rows={6}
                                multiline
                                id='textarea-outlined-static'
                                label='Descripción'
                                name='description'
                                value={value}
                                onBlur={onBlur}
                                onChange={onChange}
                                error={Boolean(updateErrors.description)}
                              />
                            )}
                          />
                          {updateErrors.description && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {updateErrors.description.message}
                            </FormHelperText>
                          )}
                        </FormControl>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button color='success' variant='outlined' type='submit'>
                            Editar
                          </Button>
                        </Box>
                      </form>
                    </DialogContent>

                  </Dialog>
                </Card>
              </Grid>
            ))}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginLeft: 'auto', marginTop: 'auto' }}>
              {isTrainerSession ? (
                <Button sx={{ marginBottom: '-30px' }} variant='contained' onClick={() => setNewSubsPopUpOpen(true)} disabled={disabled}>
                  <Icon icon='mdi:plus' />
                  Suscripción
                </Button>
              ) : null}
            </Box>

          </Grid>

          {/* componente que realiza la nueva suscripcion */}
          <NewSubsPopUp addSubscription={newSubsPopUpOpen} setAddSubscription={setNewSubsPopUpOpen} subs={subs} setSubs={setSubs}></NewSubsPopUp>

          <Dialog
            open={openSubscriptionRequest}
            onClose={hanldeSubscriptionRequest}
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
              Solicitud de suscripción
              <Typography sx={{ textAlign: 'center', fontSize: '0.9rem !important', mt: '10px' }}>
                Indicale tus preferencias al profesor.
              </Typography>
            </DialogTitle>
            <DialogContent
              sx={{
                alignItems: 'center',
                flexWrap: ['wrap', 'nowrap'],
                pt: theme => `${theme.spacing(2)} !important`,
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
              }}
            >
              <form noValidate autoComplete='off' onSubmit={sendSubsRequestHandleSubmit(sendSubscriptionRequest)}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        rows={6}
                        multiline
                        id='textarea-outlined-static'
                        label='Descripcion'
                        name='description'
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        error={Boolean(errors.description)}
                      />
                    )}
                  />
                  {errors.description && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {errors.description.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant='outlined' color='success' endIcon={<Icon icon='mdi:send' />} type='submit'>
                    Enviar
                  </Button>
                </Box>
              </form>
            </DialogContent>

          </Dialog>
          {/* POPUP BORRAR SUSCRIPCION */}
          <Dialog fullWidth open={openDeleteSubs} onClose={hadleCloseDeleteSubscriptionPopUp} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}>
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(6)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  textAlign: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '& svg': { mb: 6, color: 'warning.main' }
                }}
              >
                <Icon icon='mdi:alert-circle-outline' fontSize='5.5rem' />
                <Typography variant='h5' sx={{ mb: 5 }}>¿Seguro que deseas borrar la suscripción?</Typography>
                <Typography>Una vez borrada, no podrás recuperar la suscripción.</Typography>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: 'center',
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <Button variant='contained' sx={{ mr: 2 }} onClick={updateSubscription}>
                Confirmar
              </Button>
              <Button variant='outlined' color='secondary' onClick={hadleCloseDeleteSubscriptionPopUp} >
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>
          {/* POPUP EDITAR//BORRAR */}
          <Dialog fullWidth open={popUp} onClose={closePopUp} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}>
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(6)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  textAlign: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '& svg': { mb: 6, color: 'success.main' }
                }}
              >
                <Icon icon='mdi:check-circle-outline' fontSize='5.5rem' />
                <Typography variant='h4' sx={{ mb: 5 }}>{titlePopUp}</Typography>
                {/* <Typography>{textPopUp}</Typography> */}
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: 'center',
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >

              <Button variant='outlined' color='success' onClick={closePopUp}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Grid >
      </Grid >
    )
  } else {
    return (
      <Box sx={{ my: 1, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <CircularProgress size={100} thickness={6} color="primary" />
      </Box>
    )

  }
}


MyProfile.acl = {
  action: 'manage',
  subject: 'myProfile-page'
}


export default MyProfile