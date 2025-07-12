
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Helmet } from 'react-helmet';
import { BrowserRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<BrowserRouter>
   <App />
</BrowserRouter>);
<Helmet>
        <title>INDIAN SCIENTIFIC AEROSPACE AND ROBOTICS</title>
        <meta
          name="description"
          content="Join ISAR – the top drone training center in India offering expert-led courses in drone technology, aerospace, and robotics. Enroll in Chennai’s leading drone institute today. drone training. drone training . "
        />
        <meta
          name="keywords"
          content="best drone training center in Chennai, drone training in India, drone pilot certification, aerospace training, ISAR"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="ISAR | Best Drone Training in India" />
        <meta
          property="og:description"
          content="Learn drone flying, aerial survey, and robotics from certified experts at ISAR – Indian Scientific Aerospace and Robotics."
        />
        <meta property="og:image" content="/isar-preview.png" />
        <meta property="og:url" content="https://www.isar.in" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ISAR | Drone Training Institute in India" />
        <meta name="twitter:description" content="Expert drone pilot training in Chennai at ISAR. Join India's top aerospace and robotics institute." />
        <meta name="twitter:image" content="/isar-preview.png" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ISAR - Indian Scientific Aerospace and Robotics",
            "image": "https://www.isar.in/isar-preview.png",
            "url": "https://www.isaar.in",
            "telephone": "+91-6374720788",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "339/2 at kurunji Nagar Valayapatti, Mohanur , Namakkal District, Tamil Nadu",
              "addressLocality": "Chennai",
              "addressRegion": "Tamil Nadu",
              "postalCode": "637020",
              "addressCountry": "IN"
            },
            "description": "Top drone training center in India, offering hands-on certification in drone tech, robotics, and aerospace.",
            "sameAs": ["https://www.instagram.com/_isar_25"]
          })}
        </script>
      </Helmet>

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
