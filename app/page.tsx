"use client";

import Link from "next/link";
import { ArrowRight, Target, Users, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BullsEye
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("home")}
                className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
              >
                About
              </button>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Let&apos;s Lock In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                Web3 Accountability Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Hit Your Goals or
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Lose Your SOL
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Lock SOL, set ambitious goals, get verified by the community, and claim rewards. 
                Accountability powered by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8">
                    Let&apos;s Lock In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("about")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">500+</div>
                  <div className="text-sm text-slate-600">Goals Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">1.2K</div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">85%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-1">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-8xl">🎯</div>
                    <p className="text-slate-500 text-sm">Placeholder Image</p>
                  </div>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold">Verified</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold">+15 SOL Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Three simple steps to achieve your goals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lock SOL</h3>
              <p className="text-slate-600">
                Set your goal and lock SOL as commitment. Higher stakes = higher motivation.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Get Verified</h3>
              <p className="text-slate-600">
                Community verifies your achievement through transparent voting system.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Claim Rewards</h3>
              <p className="text-slate-600">
                Successfully complete your goal and claim back your SOL plus reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              About BullsEye
            </h2>
            <p className="text-lg text-slate-600">
              Built by goal-setters, for goal-achievers
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              We believe in the power of accountability. BullsEye combines blockchain technology 
              with human psychology to create a platform where your commitments have real consequences. 
              By putting your money where your goals are, you&apos;re not just setting intentions—you&apos;re 
              making binding commitments that push you to succeed.
            </p>
          </div>

          {/* Team */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">The Team</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl text-white font-bold">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900">John Doe</h4>
                  <p className="text-indigo-600 text-sm mb-2">Founder & CEO</p>
                  <p className="text-slate-600">
                    Former blockchain engineer with a passion for behavioral psychology. 
                    Built BullsEye after personally struggling with goal completion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl text-white font-bold">
                  JS
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900">Jane Smith</h4>
                  <p className="text-indigo-600 text-sm mb-2">Co-Founder & CTO</p>
                  <p className="text-slate-600">
                    Solana developer and Web3 enthusiast. Architected the smart contract 
                    infrastructure that makes BullsEye trustless and transparent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Achieve Your Goals?
          </h2>
          <p className="text-xl text-indigo-100">
            Join hundreds of achievers who are turning intentions into reality
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 px-8">
              Let&apos;s Lock In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-slate-400 text-center">
        <p>© 2024 BullsEye. Built on Solana. All rights reserved.</p>
      </footer>
    </div>
  );
}