"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { Container } from 'react-bootstrap';
import MyNavbar from '../components/MyNavbar';

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="d-flex flex-column min-vh-100">
        <MyNavbar />
        <main style={{ paddingTop: '80px', flex: '1 0 auto' }}>
          <Container className="py-4">
            {children}
          </Container>
        </main>
        <footer className="footer py-3 mt-auto">
          <Container className="text-center">
            <div className="small text-white opacity-50">
              ดอนบ้านนา | Mini Project Fronend
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}

