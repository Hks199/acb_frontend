import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from "react-router";
import { FiMenu, FiUser, FiShoppingCart } from "react-icons/fi";

import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import useUserHook from '../context/UserContext';
import { logoutAccount } from '../api/authentication';

import logo from "../assets/logo.jpeg";

const drawerWidth = 240;
const navItems = [
  { title: 'Home', path: '/' },
  { title: 'Products', path: '/products' },
  { title: 'About Us', path: '/#about' },
  { title: 'Art Gallery', path: '/art-gallery' },
  { title: 'Contact Us', path: '/#contact' },
];

function Navbar(props) {
  const { window, isAuth } = props;
  const { setUser, setIsAuth } = useUserHook();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAboutClick = () => {
    if (location.pathname === "/") {
      // Already on the home page, just scroll
      const el = document.getElementById("about");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home and scroll using hash
      navigate("/#about");
    }
  };

  const handleContactClick = () => {
    if (location.pathname === "/") {
      // Already on the home page, just scroll
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home and scroll using hash
      navigate("/#contact");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    if(isAuth){
      setOpen((prevOpen) => !prevOpen);
    }
    else{
      setOpen(false);
      navigate("/login");
    }
  };
  
  const handleCart = () => {
    if(isAuth){
      navigate("/cart")
    }
    else{
      navigate("/login");
    }
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const goToProfile = () => {
    navigate("/profile");
    setOpen(false);
  };

  const goToOrders = () => {
    navigate("/orders");
    setOpen(false);
  };

  const handleLogout = async() => {
    try{
      await logoutAccount();
      setIsAuth(false);
      setUser(null);
      setOpen(false);
      navigate("/login")
    } catch(err){}
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      {/* <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography> */}
      <div className='flex justify-center'>
        <img src={logo} className='py-2 h-24'/>
      </div>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.title} disablePadding >
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.title} onClick={() => {
                if(item.path === "/#about"){
                  handleAboutClick();
                }
                else if(item.path === "/#contact"){
                  handleContactClick();
                }
                else{
                  navigate(item.path)
                }
              }} />
            </ListItemButton>
          </ListItem>
        ))}

        {isAuth && (
          <>  
            <ListItem disablePadding >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary={"Profile"} onClick={goToProfile} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary={"Cart"} onClick={handleCart} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary={"Orders"} onClick={goToOrders} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary={"Logout"} onClick={handleLogout} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" sx={{
    boxShadow: '0px 4px 10px rgba(188, 188, 188, 0.26)', // Red shadow
  }}>
        <Toolbar style={{display:"flex", justifyContent:"space-between", backgroundColor:"#ffffff"}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color:"#424242" }}
          >
            <FiMenu style={{color:"#F75E69"}}/>
          </IconButton>
            <div className='pl-10 hidden sm:inline-block w-[20%]'>
              <img src={logo} className='h-12'/>
            </div>
            {/* <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, paddingLeft:5, width:"20%", color:"#424242" }}
            >
                MUI
            </Typography> */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent:"center", width:"60%" }}>
                {navItems.map((item) => (
                <Button key={item.title} onClick={() => navigate(item.path)} sx={{ color: location.pathname === item.path ? '#F75E69' : '#424242', textTransform:"capitalize", mx:2 }}>
                    {item.title}
                </Button>
                ))}
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent:"flex-end", paddingRight:5, width:"20%", minWidth:150 }}>
                  <IconButton onClick={handleCart}>
                    <FiShoppingCart color='#F75E69' />
                  </IconButton>
                    <IconButton ref={anchorRef} style={{backgroundColor:"#F5F5F5", marginLeft:10}} onClick={handleToggle}>
                      <FiUser color='#F75E69' />
                    </IconButton>
                    <Popper
                      open={open}
                      anchorEl={anchorRef.current}
                      role={undefined}
                      placement="bottom-start"
                      transition
                      disablePortal
                    >
                      {({ TransitionProps, placement }) => (
                        <Grow
                          {...TransitionProps}
                          style={{
                            transformOrigin:
                              placement === 'bottom-start' ? 'left top' : 'left bottom',
                          }}
                        >
                          <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                              <MenuList
                                autoFocusItem={open}
                                id="composition-menu"
                                aria-labelledby="composition-button"
                                onKeyDown={handleListKeyDown}
                              >
                                {/* {isAuth && (
                                  <>
                                  <MenuItem onClick={goToProfile} style={{color:"#F75E69"}}>Profile</MenuItem>
                                  <MenuItem onClick={handleClose} style={{color:"#F75E69"}}>Logout</MenuItem>
                                  </>
                                )} */}
                                <MenuItem onClick={goToProfile} style={{color:"#F75E69"}}>Profile</MenuItem>
                                <MenuItem onClick={goToOrders} style={{color:"#F75E69"}}>Orders</MenuItem>
                                <MenuItem onClick={handleLogout} style={{color:"#F75E69"}}>Logout</MenuItem>
                              </MenuList>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
            </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 0 }}>
        <Toolbar/>
      </Box>
    </Box>
  );
}

Navbar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Navbar;
