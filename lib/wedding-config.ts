/**
 * Wedding Configuration — Krishna & Rishitha
 *
 * All wedding-specific data is centralized here.
 * Components import from this file rather than hard-coding values.
 *
 * Content rules:
 * - Only confirmed wedding details (Krishna & Rishitha, Dec 11-13 2026, Penugonda AP).
 * - No invented times, parents, love stories, or venues.
 * - Single source of truth for all sections.
 */

export const wedding = {
  groom: {
    name: 'Krishna',
  },
  bride: {
    name: 'Rishitha',
  },
  coupleFormatted: 'Krishna & Rishitha',
  blessing: 'With the blessings of Sri Venkateswara Swamy',
  mainDate: 'December 13, 2026',
  tagline: 'The Wedding',
  year: 2026,

  /** Countdown target date (IST) */
  targetDate: '2026-12-13T09:00:00+05:30',

  /** Three-day confirmed celebration schedule */
  events: [
    {
      id: 'haldi-sangeeth',
      date: '2026-12-11',
      day: '11 December',
      dateFormatted: 'December 11, 2026',
      number: '01',
      title: 'Haldi & Sangeeth',
      subtitle: 'The First Chapter',
      chapterTag: 'THE FIRST CHAPTER',
      description: 'Haldi & Sangeeth celebrations.',
      timingPlaceholder: 'Details to be announced',
    },
    {
      id: 'bride-to-be',
      date: '2026-12-12',
      day: '12 December',
      dateFormatted: 'December 12, 2026',
      number: '02',
      title: 'Bride-to-be Celebration',
      subtitle: 'The Bridal Chapter',
      chapterTag: 'THE BRIDAL CHAPTER',
      description: 'Bride-to-be celebration.',
      timingPlaceholder: 'Details to be announced',
    },
    {
      id: 'wedding-ceremony',
      date: '2026-12-13',
      day: '13 December',
      dateFormatted: 'December 13, 2026',
      number: '03',
      title: 'Wedding Ceremony',
      subtitle: 'The Sacred Ceremony',
      chapterTag: 'THE SACRED CEREMONY',
      description: 'The wedding ceremony.',
      timingPlaceholder: 'Details to be announced',
    },
  ],

  /** Actual wedding location — Penugonda, Andhra Pradesh */
  location: {
    name: 'Penugonda',
    region: 'Andhra Pradesh',
    fullName: 'Penugonda, Andhra Pradesh',
    title: 'THE WEDDING',
    heading: 'Penugonda, Andhra Pradesh',
    dateLabel: 'December 13, 2026',
    mapsUrl: 'https://maps.app.goo.gl/cmvf2Tt6nAr7tj2T7',
    image: '/images/penugonda-home.webp',
    caption: 'Penugonda, Andhra Pradesh',
  },



  /** Countdown metadata */
  countdown: {
    label: 'UNTIL THE WEDDING',
    heading: 'UNTIL THE WEDDING',
    targetDate: '2026-12-13T09:00:00+05:30',
  },

  /** RSVP Configuration */
  rsvp: {
    label: 'RSVP',
    heading: 'JOIN US FOR THE CELEBRATION',
    subtext: '',
    whatsappNumber: '917995120344',
    whatsappMessage:
      "Hello, I would like to RSVP for Krishna & Rishitha's wedding.",
  },

  /**
   * Chapters for Navigation
   */
  chapters: [
    { id: 'beginning', number: '01', label: 'BEGINNING' },
    { id: 'countdown', number: '02', label: 'COUNTDOWN' },
    { id: 'events', number: '03', label: 'EVENTS' },
    { id: 'join', number: '04', label: 'JOIN' },
    { id: 'venue', number: '05', label: 'VENUE' },
    { id: 'closing', number: '06', label: 'CLOSING' },
  ],

  /** Asset paths (relative to /public) */
  assets: {
    hero: '/images/hero.webp',
    entrance: '/images/wedding-entrance.webp',
    mandapam: '/images/wedding-mandapam.webp',
    gopuram: '/images/tirumala-gopuram.webp',
    hills: '/images/seshachalam-hills.webp',
    pushkarini: '/images/pushkarini.webp',
    deepam: '/images/deepam.webp',
    home: '/images/penugonda-home.webp',
    decorations: '/decorations',
    audio: '/audio',
  },
} as const;

export type WeddingConfig = typeof wedding;
export type WeddingEvent = (typeof wedding.events)[number];
export type WeddingChapter = (typeof wedding.chapters)[number];
