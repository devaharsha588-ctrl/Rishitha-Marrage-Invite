'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMING, EASING, prefersReducedMotion } from '@/lib/motion';
import { setupMagneticElement } from '@/components/experience/interaction';

export const RSVPSection: React.FC = () => {
  const [attending, setAttending] = useState<'yes' | 'no' | null>('yes');
  const [name, setName] = useState('');
  const [guests, setGuests] = useState('2');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSaved, setIsSaved] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const whatsappBtnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReduced) {
      if (headingRef.current) headingRef.current.style.opacity = '1';
      if (cardRef.current) cardRef.current.style.opacity = '1';
      if (whatsappRef.current) whatsappRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      // Spatial Entrance: enters AFTER Deepam plane is established (top 48%)
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 48%',
          toggleActions: 'play none none reverse',
        },
      });

      enterTl
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: TIMING.MEDIUM, ease: EASING.PRIMARY_REVEAL }
        )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 32, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1.0, duration: TIMING.LONG, ease: EASING.PRIMARY_REVEAL },
          '-=0.5'
        )
        .fromTo(
          whatsappRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: TIMING.MEDIUM, ease: EASING.PRIMARY_REVEAL },
          '-=0.4'
        );

      // Transition 06: Glass RSVP card exits cleanly before Penugonda appears
      gsap.to([headingRef.current, cardRef.current, whatsappRef.current], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 85%',
          end: 'bottom 40%',
          scrub: 0.3,
        },
        opacity: 0,
        y: -18,
        ease: 'none',
      });
    }, sectionRef);

    // Magnetic interaction on buttons
    const cleanupSubmit = setupMagneticElement(submitBtnRef.current, 3);
    const cleanupWa = setupMagneticElement(whatsappBtnRef.current, 3);

    return () => {
      ctx.revert();
      cleanupSubmit();
      cleanupWa();
    };
  }, []);

  // Handle Form Submission with: CONFIRM -> SAVING... -> SAVED
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitStatus('saving');

    setTimeout(() => {
      setSubmitStatus('saved');

      setTimeout(() => {
        if (prefersReducedMotion()) {
          setIsSaved(true);
          return;
        }

        if (formRef.current && confirmationRef.current) {
          gsap.to(formRef.current, {
            opacity: 0,
            y: 10,
            duration: TIMING.FAST,
            ease: EASING.IMAGE_MOVE,
            onComplete: () => {
              setIsSaved(true);
              gsap.fromTo(
                confirmationRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: TIMING.SHORT, ease: EASING.PRIMARY_REVEAL }
              );
            },
          });
        } else {
          setIsSaved(true);
        }
      }, 550);
    }, 650);
  };

  // Prefilled WhatsApp message
  const attendanceText = attending === 'yes' ? "I'll join" : "Can't make it";
  const guestCountText = attending === 'yes' ? `\nGuests: ${guests}` : '';
  const guestNameText = name.trim() ? `\nName: ${name.trim()}` : '';
  const prefilledMessage = `Hello, I would like to RSVP for Krishna & Rishitha's wedding.${guestNameText}\nAttendance: ${attendanceText}${guestCountText}`;
  const whatsappHref = `https://wa.me/917995120344?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <section
      id="join"
      ref={sectionRef}
      aria-label="RSVP Invitation"
      className="relative w-full min-h-[100svh] flex flex-col justify-center items-center text-center overflow-hidden bg-transparent select-none"
      style={{
        paddingLeft: '14px',
        paddingRight: '14px',
        paddingTop: 'calc(40px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Target anchor for #rsvp */}
      <span id="rsvp" className="absolute top-0 pointer-events-none" />

      {/* Atmospheric Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.35) 0%, rgba(42, 12, 17, 0.2) 50%, rgba(42, 12, 17, 0.75) 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Section Heading: JOIN US FOR THE CELEBRATION */}
        <h2
          ref={headingRef}
          className="opacity-0 font-serif font-normal text-white leading-[1.08] tracking-[-0.02em] text-center mb-6 sm:mb-8 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] uppercase max-w-xl mx-auto px-2"
          style={{
            fontSize: 'clamp(26px, 6vw, 56px)',
          }}
        >
          JOIN US FOR <br className="hidden sm:inline" />
          THE CELEBRATION
        </h2>

        {/* Glassmorphism RSVP Card (Section 17: w-[calc(100vw-28px)] max-w-[420px] on mobile) */}
        <div
          ref={cardRef}
          className="opacity-0 w-[calc(100vw-28px)] max-w-[420px] sm:max-w-[500px] mx-auto p-5 sm:p-8 rounded-[20px] sm:rounded-[22px] flex flex-col text-left transition-all duration-300 will-change-transform"
          style={{
            backgroundColor: 'rgba(40, 10, 16, 0.34)',
            backdropFilter: 'blur(20px) saturate(120%)',
            WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            border: '1px solid rgba(201, 162, 74, 0.38)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          }}
        >
          {isSaved ? (
            /* Confirmation Message */
            <div
              ref={confirmationRef}
              className="w-full py-8 flex flex-col items-center text-center"
            >
              <span className="w-2.5 h-2.5 rotate-45 bg-[#C89B3C] mb-4" />
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal mb-2 tracking-wide uppercase">
                THANK YOU
              </h3>
              <p className="font-sans text-[11px] sm:text-[12px] font-medium tracking-[0.16em] uppercase text-[#C89B3C] max-w-xs mb-6">
                YOUR RESPONSE HAS BEEN SAVED.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSaved(false);
                  setSubmitStatus('idle');
                }}
                className="min-h-[44px] text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-[#F7F0DF]/70 underline underline-offset-4 cursor-pointer hover:text-[#C89B3C] transition-colors"
              >
                Edit Response
              </button>
            </div>
          ) : (
            /* Glass Form */
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
            >
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="rsvp-name"
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B3C]"
                >
                  FULL NAME
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-[12px] text-[#F7F0DF] font-sans text-sm placeholder:text-[#F7F0DF]/55 focus:outline-hidden transition-colors duration-250 min-h-[46px]"
                  style={{
                    backgroundColor: 'rgba(20, 5, 9, 0.28)',
                    border: '1px solid rgba(201, 162, 74, 0.28)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201, 162, 74, 0.85)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201, 162, 74, 0.28)';
                  }}
                />
              </div>

              {/* Attendance Choice (Section 17: grid-cols-2 min-h-[46px]) */}
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B3C]">
                  ATTENDING?
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAttending('yes')}
                    className={`min-h-[46px] py-2.5 px-2 sm:px-3 rounded-[12px] font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-250 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
                    attending === 'yes'
                      ? 'text-[#F7F0DF] shadow-md font-bold'
                      : 'text-[#F7F0DF]/70 hover:text-[#F7F0DF]'
                  }`}
                    style={{
                      backgroundColor:
                        attending === 'yes'
                          ? 'rgba(201, 162, 74, 0.3)'
                          : 'rgba(20, 5, 9, 0.28)',
                      border:
                        attending === 'yes'
                          ? '1px solid rgba(201, 162, 74, 0.85)'
                          : '1px solid rgba(201, 162, 74, 0.25)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    I&apos;LL JOIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending('no')}
                    className={`min-h-[46px] py-2.5 px-2 sm:px-3 rounded-[12px] font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-250 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
                    attending === 'no'
                      ? 'text-[#F7F0DF] shadow-md font-bold'
                      : 'text-[#F7F0DF]/70 hover:text-[#F7F0DF]'
                  }`}
                    style={{
                      backgroundColor:
                        attending === 'no'
                          ? 'rgba(201, 162, 74, 0.3)'
                          : 'rgba(20, 5, 9, 0.28)',
                      border:
                        attending === 'no'
                          ? '1px solid rgba(201, 162, 74, 0.85)'
                          : '1px solid rgba(201, 162, 74, 0.25)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    CAN&apos;T MAKE IT
                  </button>
                </div>
              </div>

              {/* Number of Guests */}
              {attending === 'yes' && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="rsvp-guests"
                    className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B3C]"
                  >
                    NUMBER OF GUESTS
                  </label>
                  <div className="relative">
                    <select
                      id="rsvp-guests"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-4 py-3 rounded-[12px] text-[#F7F0DF] font-sans text-sm focus:outline-hidden transition-colors duration-250 min-h-[46px] appearance-none pr-10 cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(20, 5, 9, 0.28)',
                        border: '1px solid rgba(201, 162, 74, 0.28)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 74, 0.85)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 74, 0.28)';
                      }}
                    >
                      <option value="1" className="bg-[#2A0C11] text-[#F7F0DF]">
                        1 Guest
                      </option>
                      <option value="2" className="bg-[#2A0C11] text-[#F7F0DF]">
                        2 Guests
                      </option>
                      <option value="3" className="bg-[#2A0C11] text-[#F7F0DF]">
                        3 Guests
                      </option>
                      <option value="4" className="bg-[#2A0C11] text-[#F7F0DF]">
                        4 Guests
                      </option>
                      <option value="5+" className="bg-[#2A0C11] text-[#F7F0DF]">
                        5+ Guests
                      </option>
                    </select>
                    {/* Down Arrow Chevron */}
                    <div
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#C89B3C]"
                      aria-hidden="true"
                    >
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button (min-height: 46px) */}
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={submitStatus !== 'idle'}
                className="w-full mt-2 min-h-[46px] py-3 rounded-[12px] font-sans text-[11px] sm:text-[11.5px] font-bold tracking-[0.22em] uppercase transition-all duration-250 cursor-pointer flex items-center justify-center hover:brightness-110 shadow-lg text-[#2A0C11] disabled:opacity-90 disabled:cursor-wait"
                style={{
                  background:
                    'linear-gradient(135deg, #D4AF37 0%, #C89B3C 50%, #B8860B 100%)',
                  boxShadow: '0 8px 24px rgba(201, 162, 74, 0.3)',
                }}
              >
                <span>
                  {submitStatus === 'idle'
                    ? 'CONFIRM'
                    : submitStatus === 'saving'
                    ? 'SAVING...'
                    : 'SAVED'}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* WhatsApp Button (min-height: 46px, max-w within viewport) */}
        <div ref={whatsappRef} className="opacity-0 mt-6 sm:mt-8 flex justify-center w-full px-2">
          <a
            ref={whatsappBtnRef}
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RSVP directly on WhatsApp"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-full font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-250 cursor-pointer text-[#F7F0DF] min-h-[46px] hover:text-[#C89B3C] max-w-full truncate"
            style={{
              backgroundColor: 'rgba(40, 10, 16, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(201, 162, 74, 0.45)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span>WHATSAPP</span>
            <span aria-hidden="true" className="text-[#C89B3C] text-sm">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default RSVPSection;
