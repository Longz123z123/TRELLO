import React from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import Check from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
function Templates() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <Box>
      <Button sx={{ color: 'white' }} id="basic-button-starred" aria-controls={open ? 'basic-menu-starred' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick} endIcon={<ExpandMoreIcon />}>
        Templates
      </Button>

      <Menu
        id="basic-menu-starred"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-starred'
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Check />
          </ListItemIcon>
          Features will be added in the future
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Templates
