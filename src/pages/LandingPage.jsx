import { useEffect } from 'react';
import { Strip } from '../components/Strip';
import { Hero } from '../components/Hero';
import { ValueList } from '../components/ValueList';
import { PriceSection } from '../components/PriceSection';
import { BookingForm } from '../components/BookingForm';
import { landingContent } from '../data/landing';
import { initPixel } from '../lib/pixel';

export function LandingPage({ source = 'business' }) {
  const content = landingContent[source] || landingContent.business;

  useEffect(() => {
    initPixel();
  }, []);

  return (
    <div className="page">
      <Strip />
      <Hero
        tag={content.tag}
        title={content.title}
        titleHighlight={content.titleHighlight}
        sub={content.sub}
      />
      <main className="content-wrap">
        <div className="content-pitch">
          <div className="section-label">ماذا تتعلم</div>
          <ValueList items={content.points} />
          <PriceSection />
        </div>
        <BookingForm source={source} />
      </main>
    </div>
  );
}
