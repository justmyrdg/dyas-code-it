import { Component } from '@angular/core';

import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Hero } from '../../components/landing/hero/hero';
import { Features } from '../../components/landing/features/features';
import { HowItWorks } from '../../components/landing/how-it-works/how-it-works';
import { Pricing } from '../../components/landing/pricing/pricing';
import { Testimonials } from '../../components/landing/testimonials/testimonials';
import { CtaSection } from '../../components/landing/cta-section/cta-section';

@Component({
  selector: 'app-landing',
  imports: [Header, Footer, Hero, Features, HowItWorks, Pricing, Testimonials, CtaSection],
  templateUrl: './landing.html',
})
export class Landing {}
