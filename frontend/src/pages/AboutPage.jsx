import { MapPin, Phone, Mail, TreePine, Waves, Mountain, Utensils } from 'lucide-react';
import Button from '../components/ui/Button';

const highlights = [
  { icon: TreePine, title: '50 Hectares of Forest', desc: 'Private trails wind through protected woodland.' },
  { icon: Waves, title: 'Crystal Lake', desc: 'A pristine lake with sandy shores and kayak rentals.' },
  { icon: Mountain, title: 'Mountain Panoramas', desc: 'Stunning views of the Carpathian ridge from every angle.' },
  { icon: Utensils, title: 'Farm-to-Table Dining', desc: 'On-site restaurant using locally sourced ingredients.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">About VibeHotel</h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            A nature retreat designed for those who seek tranquility without compromising comfort.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-text-muted leading-relaxed">
            Founded in 2018, VibeHotel started as a single lakeside cabin built by a family
            passionate about sustainable living and the healing power of nature. Over the years
            the retreat has grown into a collection of seven unique accommodations — from cozy
            forest cabins to a luxurious riverside villa — all carefully designed to blend
            seamlessly with the surrounding landscape. We believe that the best vacations leave
            you feeling more connected — to nature, to loved ones, and to yourself.
          </p>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">What Makes Us Special</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl bg-white p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <h.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold font-sans">{h.title}</h3>
                <p className="text-sm text-text-muted">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
            ].map((src, i) => (
              <div key={i} className="aspect-[3/2] rounded-xl overflow-hidden">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Get in Touch</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden h-80 lg:h-auto">
              <iframe
                title="VibeHotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2573.2!2d24.0!3d48.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDU0JzAwLjAiTiAyNMKwMDAnMDAuMCJF!5e0!3m2!1sen!2sua!4v1600000000000"
                className="h-full w-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Info + Form */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>123 Retreat Lane, Mountain Valley, Carpathian Region, 12345</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-accent shrink-0" />
                  +1 (555) 012-3456
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-accent shrink-0" />
                  hello@vibehotel.com
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('This is a UI demo — message not sent.');
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <textarea
                  rows="4"
                  placeholder="Your message"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  required
                />
                <Button type="submit">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
