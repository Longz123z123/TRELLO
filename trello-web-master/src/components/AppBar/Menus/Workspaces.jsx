import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Link } from 'react-router-dom'

function Workspaces() {
  return (
    <Box>
      <Button component={Link} to="/boards" sx={{ color: 'white' }} endIcon={<ExpandMoreIcon />}>
        Workspaces
      </Button>
    </Box>
  )
}

export default Workspaces
