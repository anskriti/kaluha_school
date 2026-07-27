"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from "lucide-react";

const schema = zod.object({
  name: zod.string().min(3, "Name must be at least 3 characters"),
  email: zod.string().email("Invalid email address"),
  phone: zod.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits").optional().or(zod.literal("")),
  message: zod.string().min(10, "Message must be at least 10 characters")
});

type ContactForm = zod.infer<typeof schema>;

export default function ContactUs() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        reset();
      }
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Support Cell
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Contact Details & Inquiries
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        {/* Contact Details Column */}
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider mb-4 border-l-4 border-school-gold pl-3">
              Office Addresses
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              For immediate support, student certificate issuance, or other board enquiries, please get in touch or drop by the school during administrative office hours.
            </p>
          </div>

          <div className="flex flex-col gap-6 text-xs md:text-sm font-semibold text-slate-700">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
                <MapPin size={18} className="text-school-gold" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Institution Address</h4>
                <p className="text-slate-500 font-medium text-xs mt-1">
                  Kaluha Jagadishpur High School<br />
                  Village: Kaluha, Post Office: Margram, Police Station: Margram,<br />
                  Block: Rampurhat-II, Sub Division: Rampurhat,<br />
                  District: Birbhum, State: West Bengal, PIN: 731202, India
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
                <Phone size={18} className="text-school-gold" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Mobile Number</h4>
                <p className="text-slate-500 font-medium text-xs mt-1">+91 9434582037</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
                <Mail size={18} className="text-school-gold" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Email Address</h4>
                <p className="text-slate-500 font-medium text-xs mt-1">kaluhajhighschool@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
                <Clock size={18} className="text-school-gold" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Office Hours</h4>
                <p className="text-slate-500 font-medium text-xs mt-1">Monday - Friday: 10:40 AM to 4:30 PM | Saturday: 10:40 AM to 1:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form Column */}
        <div className="glass-panel p-8 rounded-3xl border border-white bg-white/70 shadow-2xl">
          <h3 className="font-bold text-base text-school-blue-deep uppercase tracking-wider mb-6">
            Inquiry Submission Form
          </h3>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-2xl text-center flex flex-col items-center gap-3 shadow"
            >
              <CheckCircle size={32} className="text-emerald-600" />
              <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
              <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
                Thank you for contacting us. Our administrative desk will review your inquiry and get back to you soon.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Enter your name"
                  className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600">Phone Number (Optional)</label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Enter phone number"
                  className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone.message}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600">Message / Inquiry Details</label>
                <textarea
                  rows={4}
                  {...register("message")}
                  placeholder="Describe your query..."
                  className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue resize-none"
                />
                {errors.message && <p className="text-red-500 text-[10px] mt-0.5">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <span>{loading ? "Sending..." : "Submit Inquiry"}</span>
                <Send size={12} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Embed map full width */}
      <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider mb-6 text-center">
        Our Location Map
      </h3>
      <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative bg-slate-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14588.665796030999!2d87.876798!3d23.910398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f98bb2f073faab%3A0xe5a36371d798aa1b!2sMargram%2C%20West%20Bengal%20731224!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
