import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'

const classCards = [
  {
    title: 'Core Foundations',
    description:
      'A slow-burn sculptural practice focusing on deep stabilizer muscles and spinal alignment.',
    tags: ['Strength', '60 Min'],
    image:
      'https://images.unsplash.com/photo-1599447421388-58c2f58f3f2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Reform & Release',
    description:
      'Combining traditional reformer techniques with contemporary mobility sequences.',
    tags: ['Flow', '45 Min'],
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Breath & Stillness',
    description:
      'A restorative session using breathwork to reset the nervous system and calm the mind.',
    tags: ['Restorative', '75 Min'],
    image:
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
  },
]

const instructors = [
  {
    name: 'Sienna Rhodes',
    specialty: 'Reformer & Core',
    summary: 'Rooted in precision and athletic flow.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Julian Vance',
    specialty: 'Breathwork & Mobility',
    summary: 'Focused on restorative alignment and nervous system health.',
    image:
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Maya Chen',
    specialty: 'Strength & Alignment',
    summary: 'Building functional power through mindful resistance.',
    image:
      'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&q=80',
  },
]

const pricingCards = [
  { name: 'Pack 8', sessions: '8 seances', price: '290 DT', validity: 'Valable 40 jours' },
  { name: 'Pack 12', sessions: '12 seances', price: '390 DT', validity: 'Valable 60 jours' },
  { name: 'Pack 12+', sessions: '12 seances', price: '390 DT', validity: 'Valable 90 jours' },
  { name: 'Pack 20', sessions: '20 seances', price: '590 DT', validity: 'Valable 90 jours' },
  { name: 'Pack 50', sessions: '50 seances', price: '1290 DT', validity: 'Valable 180 jours' },
]

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-body">
      <section className="relative min-h-[88vh] overflow-hidden border-b border-[#e8e4dc]">
        <img
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80"
          alt="Sunlit studio interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#fcf9f4]/70" />
        <div className="relative mx-auto max-w-[1280px] px-6 pb-20 pt-40 md:px-10">
          <p className="mb-6 text-[11px] uppercase tracking-[0.32em] text-[#7d562d]">Editorial Wellness</p>
          <h1 className="font-headline text-6xl italic leading-[0.9] tracking-tight text-[#384535] md:text-8xl">
            The Art of
            <br />
            Presence.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[#444841] md:text-lg">
            A curated sanctuary for the modern practitioner where architectural silence meets
            intentional movement.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={session ? '/schedule' : '/login'}
              className="rounded-md bg-[#384535] px-8 py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[#4f5d4b]"
            >
              {session ? 'Book Session' : 'Join Now'}
            </Link>
            <Link
              href="/schedule"
              className="rounded-md border border-[#b8b4ad] bg-white/70 px-8 py-3 text-xs uppercase tracking-[0.2em] text-[#1c1c19] transition hover:bg-white"
            >
              Browse Schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#7d562d]">Our Curriculum</p>
            <h2 className="font-headline text-5xl italic leading-tight md:text-6xl">Move with intention</h2>
          </div>
          <Link href="/schedule" className="text-xs uppercase tracking-[0.2em] text-[#384535] underline-offset-4 hover:underline">
            See All Classes
          </Link>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[980px] grid-cols-3 gap-6">
            {classCards.map((item) => (
              <article key={item.title} className="group rounded-2xl border border-[#e8e4dc] bg-white p-4 shadow-sm transition hover:-translate-y-1">
                <div className="overflow-hidden rounded-xl">
                  <img src={item.image} alt={item.title} className="h-[350px] w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#f0ede8] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#444841]">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 font-headline text-3xl italic text-[#1c1c19]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444841]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f3ee] py-24">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#7d562d]">Our Instructors</p>
            <h2 className="font-headline text-5xl italic leading-tight md:text-6xl">
              Expert guidance, rooted in intention
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#444841]">
              Our instructors blend precision, warmth, and personalized coaching to support every
              stage of your practice.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white p-3 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1518611012118-f8f589e4c1f2?auto=format&fit=crop&w=1400&q=80"
                alt="Studio44 instructors"
                className="h-[360px] w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="space-y-5 lg:col-span-5 lg:pt-24">
            {instructors.map((instructor) => (
              <article key={instructor.name} className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-headline text-3xl italic leading-none">{instructor.name}</h3>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#7d562d]">{instructor.specialty}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#444841]">{instructor.summary}</p>
              </article>
            ))}
            <Link
              href="/instructors"
              className="inline-flex items-center text-xs uppercase tracking-[0.22em] text-[#384535] underline-offset-4 hover:underline"
            >
              Meet the Instructors
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
        <div className="text-center">
          <h2 className="font-headline text-5xl italic leading-tight md:text-6xl">
            Find the right class for your rhythm
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#444841]">
            Explore daily offerings and curate your week of wellness.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-[#e8e4dc] bg-white p-6">
          <div className="grid grid-cols-1 gap-4">
            <article className="grid gap-4 rounded-xl border border-[#ece9e4] p-5 md:grid-cols-[120px_1fr_180px] md:items-center">
              <div>
                <p className="font-headline text-3xl italic">07:00</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#747871]">Morning</p>
              </div>
              <div>
                <h3 className="font-headline text-2xl italic">Solar Flow Vinyasa</h3>
                <p className="text-sm text-[#444841]">With Elena Vance · Studio A</p>
              </div>
              <div className="md:text-right">
                <Link href={session ? '/schedule' : '/login'} className="inline-block rounded-md bg-[#384535] px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white">
                  Book Spot
                </Link>
              </div>
            </article>

            <article className="grid gap-4 rounded-xl border border-[#ece9e4] p-5 md:grid-cols-[120px_1fr_180px] md:items-center">
              <div>
                <p className="font-headline text-3xl italic">09:30</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#747871]">Late Morning</p>
              </div>
              <div>
                <h3 className="font-headline text-2xl italic">Advanced Reformer</h3>
                <p className="text-sm text-[#444841]">With Marcus Thorne · Pilates Suite</p>
              </div>
              <div className="md:text-right">
                <span className="inline-block rounded-md bg-[#ffdcbd] px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#623f18]">
                  Waitlist Only
                </span>
              </div>
            </article>
          </div>

          <div className="mt-8 text-center">
            <Link href="/schedule" className="text-xs uppercase tracking-[0.22em] text-[#384535] underline-offset-4 hover:underline">
              Full Schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#fcf9f4] py-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="text-center">
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#7d562d]">Invest in Self</p>
            <h2 className="font-headline text-5xl italic leading-tight md:text-6xl">Memberships & Credits</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pricingCards.map((plan) => (
              <article key={`${plan.name}-${plan.validity}`} className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
                <h3 className="font-headline text-3xl italic">{plan.name}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7d562d]">{plan.sessions}</p>
                <p className="mt-5 font-headline text-5xl italic text-[#1c1c19]">{plan.price}</p>
                <p className="mt-2 text-sm text-[#444841]">{plan.validity}</p>
                <button className="mt-6 w-full rounded-md border border-[#384535] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#384535] transition hover:bg-[#384535] hover:text-white">
                  Choisir cette offre
                </button>
              </article>
            ))}

            <article className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
              <h3 className="font-headline text-3xl italic">Seance privee</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7d562d]">1 seance</p>
              <p className="mt-5 font-headline text-5xl italic text-[#1c1c19]">80 DT</p>
              <p className="mt-2 text-sm text-[#444841]">Valable une fois</p>
              <button className="mt-6 w-full rounded-md border border-[#384535] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#384535] transition hover:bg-[#384535] hover:text-white">
                Choisir cette offre
              </button>
            </article>

            <article className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
              <h3 className="font-headline text-3xl italic">Seance collective</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7d562d]">1 seance</p>
              <p className="mt-5 font-headline text-5xl italic text-[#1c1c19]">40 DT</p>
              <p className="mt-2 text-sm text-[#444841]">Valable une fois</p>
              <button className="mt-6 w-full rounded-md border border-[#384535] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#384535] transition hover:bg-[#384535] hover:text-white">
                Choisir cette offre
              </button>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e4dc] bg-[#f6f3ee] py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:px-10 md:text-left">
          <div>
            <p className="font-headline text-2xl italic text-[#384535]">Studio44</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#747871]">
              Editorial wellness studio
            </p>
          </div>
          <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] text-[#747871]">
            <Link href="/schedule">Classes</Link>
            <Link href="/instructors">Instructors</Link>
            <Link href="/login">Book</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
