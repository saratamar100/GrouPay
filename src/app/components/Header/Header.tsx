import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import styles from './Header.module.css'; 

const navLinks = [
  { title: 'אודות', path: '/about' },
  { title: 'פרופיל', path: '/profile' },
  { title: 'התנתקות', path: '/logout' },
];

const Header: React.FC = () => {
  return (
    <AppBar position="static" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.navContainer}>
          {navLinks.map((link) => (
            <Link key={link.title} href={link.path} passHref legacyBehavior>
              <Button component="a" color="inherit" className={styles.navButton}>
                {link.title}
              </Button>
            </Link>
          ))}
        </Box>

        <Typography variant="h5" component="div" className={styles.logo}>
          GrouPay
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
