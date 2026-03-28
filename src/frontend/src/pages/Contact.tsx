import { Clock, Mail } from "lucide-react";
import { SiInstagram } from "react-icons/si";

export default function Contact() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-5xl block mb-4">💌</span>
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
            We&apos;d Love to Hear from You
          </p>
          <h1 className="text-4xl font-black text-foreground">Contact Us 🌸</h1>
          <p className="mt-3 text-muted-foreground font-medium">
            Questions, custom requests, or just want to say hi — we&apos;re
            always happy to chat!
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Email */}
          <div className="bg-card rounded-2xl p-6 shadow-card flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-black text-base mb-1">Email Us</h3>
              <a
                href="mailto:crochetcomm1@gmail.com"
                className="text-primary font-semibold hover:underline"
                data-ocid="contact.link"
              >
                crochetcomm1@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                For orders, custom requests, and general questions.
              </p>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-card rounded-2xl p-6 shadow-card flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
              <SiInstagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base mb-1">Instagram</h3>
              <a
                href="https://instagram.com/crochet.comm_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
                data-ocid="contact.link"
              >
                @crochet.comm_
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                Follow us for sneak peeks, crochet tips, and behind-the-scenes
                magic ✨
              </p>
            </div>
          </div>

          {/* Response time */}
          <div className="bg-card rounded-2xl p-6 shadow-card flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-base mb-1">Response Time</h3>
              <p className="text-foreground font-semibold">
                Within 24–48 hours 🌸
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We reply to all messages as quickly as possible. Thank you for
                your patience!
              </p>
            </div>
          </div>

          {/* Warm note */}
          <div
            className="rounded-3xl p-8 text-center"
            style={{ background: "oklch(var(--lavender))" }}
          >
            <p className="font-black text-lg mb-2">
              Every message means the world to us 💖
            </p>
            <p className="text-muted-foreground text-sm">
              We&apos;re a small handmade shop, and your support helps us keep
              doing what we love. Thank you so much for being here!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
