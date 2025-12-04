import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
// Grid: https://mui.com/material-ui/react-grid2/#whats-changed
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import HomeIcon from '@mui/icons-material/Home'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
// import CardMedia from '@mui/material/CardMedia'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation } from 'react-router-dom'
import randomColor from 'randomcolor'
import SidebarCreateBoardModal from './create'
import { fetchBoardsAPI } from '~/apis'
import { styled } from '@mui/material/styles'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

//  NEW: import để thêm menu xoá board
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { deleteBoardAPI } from '~/apis'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'

// Styles của mấy cái Sidebar item menu,  gom lại ra đây cho gọn.
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300]
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e9f2ff'
  }
}))

function Boards() {
  // Số lượng bản ghi boards hiển thị tối đa trên 1 page tùy dự án (thường sẽ là 12 cái)
  const [boards, setBoards] = useState(null)
  // Tổng toàn bộ số lượng bản ghi boards có trong Database mà phía BE trả về để FE dùng tính toán phân trang
  const [totalBoards, setTotalBoards] = useState(null)

  // ⭐ NEW: lưu danh sách anchor của menu delete theo boardId
  const [anchorEls, setAnchorEls] = useState({})

  // Xử lý phân trang từ url với MUI
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  const updateStateData = (res) => {
    // ⭐ UPDATED: tạo màu cố định cho từng board (không còn đổi màu khi mở menu)
    const boardsWithColor = (res.boards || []).map((b) => ({
      ...b,
      color: randomColor()
    }))

    setBoards(boardsWithColor)
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }, [location.search])

  const afterCreateNewBoard = () => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }

  // ⭐ NEW: mở menu của từng board
  const handleOpenMenu = (e, id) => {
    setAnchorEls({ ...anchorEls, [id]: e.currentTarget })
  }

  // ⭐ NEW: đóng menu của board
  const handleCloseMenu = (id) => {
    setAnchorEls({ ...anchorEls, [id]: null })
  }

  // ⭐ NEW: hàm xoá board gọi API
  const confirmDeleteBoard = useConfirm()

  const handleDeleteBoard = (boardId) => {
    confirmDeleteBoard({
      title: 'Delete Board?',
      description: 'This action will permanently delete this Board and all of its Columns & Cards. Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      .then(async () => {
        try {
          // 1. Gọi API xóa board
          await deleteBoardAPI(boardId)

          // 2. Refresh danh sách boards
          fetchBoardsAPI(location.search).then(updateStateData)

          toast.success('Board deleted successfully!')
        } catch (error) {
          toast.error('Failed to delete board!')
        }
      })
      .catch(() => {})
  }
  // Lúc chưa tồn tại boards > đang chờ gọi api thì hiện loading
  if (!boards) {
    return <PageLoadingSpinner caption="Loading Boards..." />
  }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ paddingX: 2, my: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={3}>
            <Stack direction="column" spacing={1}>
              <SidebarItem className="active">
                <SpaceDashboardIcon fontSize="small" />
                Boards
              </SidebarItem>
              <SidebarItem>
                <ListAltIcon fontSize="small" />
                Templates
              </SidebarItem>
              <SidebarItem>
                <HomeIcon fontSize="small" />
                Home
              </SidebarItem>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="column" spacing={1}>
              <SidebarCreateBoardModal afterCreateNewBoard={afterCreateNewBoard} />
            </Stack>
          </Grid>

          <Grid xs={12} sm={9}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
              Your workspace boards
            </Typography>

            {/* Trường hợp không có board */}
            {boards?.length === 0 && (
              <Typography variant="span" sx={{ fontWeight: 'bold', mb: 3 }}>
                No result found!
              </Typography>
            )}

            {/* Render danh sách boards */}
            {boards?.length > 0 && (
              <Grid container spacing={2}>
                {boards.map((b) => (
                  <Grid xs={2} sm={3} md={4} key={b._id}>
                    <Card sx={{ width: '250px', position: 'relative' }}>
                      {/* ⭐ NEW: nút mở menu delete */}
                      <IconButton sx={{ position: 'absolute', top: 4, right: 4, color: 'white', zIndex: 10 }} onClick={(e) => handleOpenMenu(e, b._id)}>
                        <MoreVertIcon />
                      </IconButton>

                      {/* ⭐ NEW: menu delete */}
                      <Menu anchorEl={anchorEls[b._id]} open={Boolean(anchorEls[b._id])} onClose={() => handleCloseMenu(b._id)}>
                        <MenuItem
                          sx={{ color: 'error.main' }}
                          onClick={() => {
                            handleCloseMenu(b._id)
                            handleDeleteBoard(b._id)
                          }}
                        >
                          <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
                          Delete Board
                        </MenuItem>
                      </Menu>

                      {/* ⭐ UPDATED: màu cover dùng màu đã fixed */}
                      <Box sx={{ height: '50px', backgroundColor: b.color }}></Box>

                      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {b?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {b.description}{' '}
                        </Typography>
                        <Box
                          component={Link}
                          to={`/boards/${b?._id}`}
                          sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.light' }
                          }}
                        >
                          Go to board <ArrowRightIcon fontSize="small" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {totalBoards > 0 && (
              <Box sx={{ my: 3, pr: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Pagination size="large" color="secondary" showFirstButton showLastButton count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)} page={page} renderItem={(item) => <PaginationItem component={Link} to={`/boards${item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`}`} {...item} />} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Boards
