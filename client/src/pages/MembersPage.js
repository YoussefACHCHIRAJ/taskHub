import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useSelector } from 'react-redux';

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
  Alert,
  AlertTitle,
  IconButton,
  Snackbar,
  Popover,
  MenuItem,
} from '@mui/material';

// hooks
import { useGetMembers, useAuthContext } from '../hooks';

// sections
import { UserListHead } from '../sections/@dashboard/user';
import {
  AddMemberModel,
  AskForCreateTeamModal,
  DeleteMemberModal,
  ErrorMessageModel
} from '../components/models';

import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'actions', label: ' ', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function MembersPage() {
  const { auth } = useAuthContext();

  const onlineUsers = useSelector(state => state.onlineUsers.value);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);

  const [open, setOpen] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [snackbarMsg, setSnackbarMsg] = useState('');

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const [memberSelected, setMemberSelected] = useState(null);

  const [users, setUsers] = useState([])

  const { error, isError, isLoading, data } = useGetMembers();

  useEffect(() => {
    if (!isLoading) {
      const users = data?.members?.map((member) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        team: member.team,
      })) || [];
      setUsers(users);
    }
  }, [isLoading, data]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleOpenMenu = (event, member) => {
    setMemberSelected(member);
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
    setMemberSelected(null);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;


  if (!auth?.user?.team) {
    return (
      <AskForCreateTeamModal />
    )
  }

  return (
    <>
      <Helmet>
        <title> Member | TaskHub </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {data?.team} members
          </Typography>
          {auth?.user?.role?.toLowerCase() === 'leader' &&
            (<Button disabled={isError} className='bg-black hover:bg-gray-900' variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpenModal(true)}>
              New Member
            </Button>)}
        </Stack>

        <AddMemberModel
          openModal={openModal}
          setOpenModal={setOpenModal}
          setOpenSnackbar={setOpenSnackbar}
          setSnackbarMsg={setSnackbarMsg}
          roles={data?.roles}
        />

        <DeleteMemberModal
          deleteConfirmationOpen={deleteConfirmationOpen}
          setDeleteConfirmationOpen={setDeleteConfirmationOpen}
          memberSelected={memberSelected}
          setOpenSnackbar={setOpenSnackbar}
          setSnackbarMsg={setSnackbarMsg}
        />

        {isLoading ? <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} disableShrink /> :

          isError ? <ErrorMessageModel message={error?.message} /> :
            !filteredUsers.length ?
              <Alert severity="info">
                <AlertTitle>info</AlertTitle>
                There is no Members yet
              </Alert>
              :

              (<Card>

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={auth.user?.role?.toLowerCase() === 'leader' ? TABLE_HEAD : TABLE_HEAD.slice(0, -1)}
                        rowCount={users.length}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { id, name, role, email } = row;
                          const isOnline = onlineUsers?.includes(id) && auth.user._id !== id;
                          return (
                            <TableRow hover key={id} tabIndex={-1}>


                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ paddingLeft: '4px', position: "relative" }}>
                                    <span className={`absolute ${isOnline ? "flex" : "hidden"} h-[.7em] w-[.7em] bottom-1/2 left-1`}>
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75">{" "}</span>
                                      <span className="relative inline-flex rounded-full h-[.7em] w-[.7em] bg-green-500">{" "}</span>
                                    </span>
                                  <Typography variant="subtitle2" noWrap className="relative">
                                    {name}{auth.user._id === id && " (You)"}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="left">{email}</TableCell>

                              <TableCell align="left">{role}</TableCell>
                              {auth.user.role?.toLowerCase() === 'leader' && auth.user.email !== email && (<TableCell align="center">
                                <IconButton size="md" color="inherit" onClick={e => handleOpenMenu(e, row)}>
                                  <Iconify icon="eva:more-vertical-fill" />
                                </IconButton>
                              </TableCell>)}

                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>

                      {isNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <Paper
                                sx={{
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="h6" paragraph>
                                  Not found
                                </Typography>

                                <Typography variant="body2">
                                  No results found for &nbsp;
                                  <strong>&quot;{filterName}&quot;</strong>.
                                  <br /> Try checking for typos or using complete words.
                                </Typography>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={users.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>)
        }
      </Container>
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >

        <MenuItem sx={{ color: 'error.main' }} onClick={() => { setOpen(false); setDeleteConfirmationOpen(true) }} >
          {/* <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} /> */}
          Delete Member
        </MenuItem>
        <MenuItem sx={{ color: 'success.main' }} onClick={() => { setOpen(false) }} >
          <Iconify icon="mdi:pencil" sx={{ mr: 2 }} />
          Update Member
        </MenuItem>
      </Popover>

      <Snackbar open={openSnackbar} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

    </>
  );
}
