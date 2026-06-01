import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck, faRotateLeft, faLock, faHeadset,
} from '@fortawesome/free-solid-svg-icons';

const features = [
  { icon: faTruck,      title: 'Free Shipping', desc: 'On orders over ₹300' },
  { icon: faRotateLeft, title: 'Easy Returns',  desc: '7 days return policy' },
  { icon: faLock,       title: 'Secure Payment',desc: '100% secure payment'  },
  { icon: faHeadset,    title: '24/7 Support',  desc: 'Dedicated support'    },
];

const categories = [
  {
    label: 'Men',
    path: '/men',
    bg: '#e8ede9',
    img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80',
  },
  {
    label: 'Women',
    path: '/women',
    bg: '#e8edf5',
    img: 'https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?w=400&q=80',
  },
  {
    label: 'Topwear',
    path: '/search?category=topwear',
    bg: '#fef3e8',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
  },
  {
    label: 'Bottomwear',
    path: '/search?category=bottomwear',
    bg: '#eaf0ea',
    img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&q=80',
  },
  {
    label: 'Accessories',
    path: '/search?category=accessories',
    bg: '#f5ede8',
    img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
  },
  {
    label: 'Footwear',
    path: '/search?category=footwear',
    bg: '#eaf0f5',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
];

const slides = [
  {
    tag:   'SUMMER COLLECTION',
    title: 'Discover Trends\nThat Inspire',
    desc:  'Up to 40% off on new season styles.',
    img:   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
    link:  '/women',
  },
  {
    tag:   'NEW ARRIVALS',
    title: 'Fresh Styles\nFor Every Season',
    desc:  'Shop the latest fashion trends.',
    img:   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=80',
    link:  '/men',
  },
  {
    tag:   'SPECIAL OFFER',
    title: 'Big Sale\nUp To 50% Off',
    desc:  'Limited time offer on selected items.',
    img:   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80',
    link:  '/search',
  },
];

export default function Home() {
  const [slide,  setSlide]  = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // ── Auto-swipe — circular (0→1→2→0→…) ──────────────────────────────────
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);   // circular
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const goTo = (i) => {
    setSlide(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 5000);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero Banner ── */}
      <section
        className="mx-6 mt-4 rounded-2xl overflow-hidden bg-gray-50 relative min-h-[340px] flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Text content */}
        <div key={`text-${slide}`} className="px-12 py-10 z-10 relative max-w-lg animate-fadeIn">
          <p className="text-green-600 text-xs font-bold tracking-widest mb-3">
            {slides[slide].tag}
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight whitespace-pre-line mb-3">
            {slides[slide].title}
          </h1>
          <p className="text-gray-500 text-sm mb-7">{slides[slide].desc}</p>
          <Link
            to={slides[slide].link}
            className="bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-lg font-semibold text-sm transition inline-block"
          >
            Shop Now
          </Link>

          {/* Dots */}
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide ? 'bg-green-600 w-5 h-3' : 'bg-gray-300 w-3 h-3'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right image */}
        <div className="absolute right-0 top-0 h-full w-[55%] flex items-center justify-end pr-8">
          <div className="absolute right-6 w-80 h-80 bg-gray-200 rounded-full" />
          <img
            key={`img-${slide}`}
            src={slides[slide].img}
            alt="banner"
            className="relative z-10 h-80 w-full object-cover object-top animate-fadeIn"
          />
        </div>

        {/* Progress bar — restarts on each slide */}
        {!paused && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200">
            <div key={`bar-${slide}`} className="h-full bg-green-600 animate-progress" />
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="mx-6 mt-6 grid grid-cols-2 md:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 py-5 px-6 border-t border-b border-gray-200
              ${i === 0 ? 'border-l' : ''}
              ${i <= 2  ? 'border-r' : ''}
              ${i === 3 ? 'border-r' : ''}`}
          >
            <div className="bg-green-50 p-3 rounded-full flex-shrink-0">
              <FontAwesomeIcon icon={f.icon} className="text-green-600 text-lg" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Featured Categories — no "Shop Now", direct navigate on click ── */}
      <section className="mx-6 mt-10 mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Featured Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{ backgroundColor: cat.bg }}
              className="rounded-2xl overflow-hidden relative h-60 group cursor-default"
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-lg leading-tight">{cat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}