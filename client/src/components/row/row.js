import { useState } from 'react';
import { Typography, IconButton, Collapse, TableRow, TableCell, Box, Stack } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Iconify from '../iconify/Iconify';
import useAuthContext from '../../hooks/useAuthContext';


function Row({ row, handleOpenMenu, options, selectedCategory }) {

  
    const { auth } = useAuthContext()
  
    const [open, setOpen] = useState(false);

    const taskStatus = (start, due) => {
       
        const today = new Date();
       
        const startDate = new Date(start);
       
        const dueDate = new Date(due);
       
        if (startDate > today) {
            return { status: 'Pending', statusColor: 'Orange', statusIcon: 'material-symbols:pending' }
        }
        
        if (startDate <= today && dueDate > today) {
            return { status: 'In Progress', statusColor: 'green', statusIcon: 'grommet-icons:in-progress' }
        }
        return { status: 'Complete', statusColor: 'red', statusIcon: 'fluent-mdl2:completed' }
    }

    const { status, statusColor, statusIcon } = taskStatus(row.start, row.due);
    
    if (selectedCategory !== 'All' && selectedCategory !== status) return null;
    
    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.title}
                </TableCell>
                <TableCell align="left">{row.start}</TableCell>
                <TableCell align="left">{row.due}</TableCell>
                <TableCell align="left">
                    <Typography sx={{ color: statusColor }}>
                        <Stack direction="row" alignItems="center" justifyContent="left" gap={1}>
                            {status} <Iconify icon={statusIcon} className='w-4 h-4' />
                        </Stack>
                    </Typography>
                </TableCell>
                {auth.user.role.toLowerCase() === 'leader' && options && (<TableCell align="left">
                    <IconButton size="md" color="inherit" onClick={e => handleOpenMenu(e, row)}>
                        <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                </TableCell>)}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Stack>
                                <Typography variant="h6" gutterBottom component="div">
                                    Description
                                </Typography>
                                <Typography variant="body2" gutterBottom component="p">
                                    {row.description}
                                </Typography>
                            </Stack>
                            <Stack>
                                <Typography variant="h6" gutterBottom component="div">
                                    responsables
                                </Typography>
                                {
                                    row.responsibleUsers.map((respo, index) => (
                                        <Typography key={index} variant="body2" gutterBottom component="p">
                                            {respo.name}{auth.user.name === respo.name && " (You)"}
                                        </Typography>
                                    )
                                    )}
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default Row;