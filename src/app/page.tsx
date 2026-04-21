'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import StatCounter from '@/components/ui/StatCounter'
import GlassCard from '@/components/ui/GlassCard'
import CategoryChart from '@/components/dashboard/CategoryChart'
import ProjectCard from '@/components/dashboard/ProjectCard'
import Timeline3D from '@/components/ui/Timeline3D'
import {
  ArrowRight,
  Shield,
  Eye,
  TrendingUp,
  MapPin,
  IndianRupee,
  BarChart3,
  Users,
  Building2,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import {
  getPublicDashboardStats,
  getCategoryStats,
  getFeaturedProjects
} from '@/lib/db/actions'

// Dynamic import for 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false })

export default function Home() {
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const [stats, setStats] = useState<any>(null)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, categoryRes, projectsRes] = await Promise.all([
          getPublicDashboardStats(),
          getCategoryStats(),
          getFeaturedProjects()
        ])

        if (statsRes) setStats(statsRes)
        setCategoryData(categoryRes)
        setFeaturedProjects(projectsRes)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Show loading skeleton or keep previous UI for smooth transition
  const displayStats = stats || {
    total_approved_grants: 127,
    villages_covered: 48,
    total_funds_allocated: 45600000,
    total_funds_utilized: 38200000,
    completed_projects: 42,
    avg_completion_percentage: 68
  }

  const sampleMilestones = [
    { id: '1', title: 'Foundation & Survey', percentage: 25, isCompleted: true, isVerified: true, date: 'Sep 2024' },
    { id: '2', title: 'Base Layer Construction', percentage: 50, isCompleted: true, isVerified: true, date: 'Dec 2024' },
    { id: '3', title: 'Surface Layer & Drainage', percentage: 75, isCompleted: true, isVerified: false, date: 'In Progress' },
    { id: '4', title: 'Final Inspection', percentage: 100, isCompleted: false, isVerified: false, date: 'Expected Apr 2025' },
  ]

  return (
    <main className="min-h-screen bg-grid">
      {/* 3D Background */}
      <Scene3D />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 mb-8"
          >
            <Shield className="w-4 h-4 text-sky-600" />
            <span className="text-sm text-sky-800 font-medium">Government of Maharashtra Initiative</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
          >
            <span className="block text-slate-800">Rural Infrastructure</span>
            <span className="block gradient-text">Grant Management</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Transparent, accountable, and efficient distribution of development funds
            for roads, water, education, power, agriculture, and healthcare across rural Maharashtra.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-[0_10px_40px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              View All Projects
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              Track Your Grant
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-24 text-sm text-slate-500 font-bold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>100% Transparent</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" />
              <span>Government Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>Real-time Tracking</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-slate-400"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            <GlassCard className="p-6 text-center" delay={0}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <StatCounter value={displayStats.total_approved_grants} label="Total Grants" />
            </GlassCard>

            <GlassCard className="p-6 text-center" delay={0.1}>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
              <StatCounter value={displayStats.villages_covered} label="Villages Covered" />
            </GlassCard>

            <GlassCard className="p-6 text-center" delay={0.2}>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-6 h-6 text-amber-400" />
              </div>
              <StatCounter value={displayStats.total_funds_allocated / 10000000} suffix="Cr" decimals={1} label="Funds Allocated" />
            </GlassCard>

            <GlassCard className="p-6 text-center" delay={0.3}>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <StatCounter value={displayStats.total_funds_utilized / 10000000} suffix="Cr" decimals={1} label="Funds Utilized" />
            </GlassCard>

            <GlassCard className="p-6 text-center" delay={0.4}>
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-pink-400" />
              </div>
              <StatCounter value={displayStats.completed_projects} label="Projects Completed" />
            </GlassCard>

            <GlassCard className="p-6 text-center" delay={0.5}>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <StatCounter value={displayStats.avg_completion_percentage} suffix="%" label="Avg. Completion" />
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Category Distribution Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Category Chart */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold mb-4 text-slate-800">
                  <span className="gradient-text">Category-wise</span> Distribution
                </h2>
                <p className="text-slate-600 font-medium">
                  Real-time allocation of funds across different infrastructure sectors
                </p>
              </motion.div>

              <GlassCard className="p-6">
                <CategoryChart data={(categoryData.length > 0 ? categoryData : [
                  { category: 'roads', application_count: 0, total_amount: 0, completed_count: 0 },
                  { category: 'water', application_count: 0, total_amount: 0, completed_count: 0 },
                ]).map(c => ({
                  category: c.category,
                  count: c.application_count,
                  amount: c.total_amount,
                  completed: c.completed_count
                }))} />
              </GlassCard>
            </div>

            {/* Right: Sample Timeline */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold mb-4 text-slate-800">
                  <span className="gradient-text">Project</span> Timeline
                </h2>
                <p className="text-slate-600 font-medium">
                  Track milestones and progress with verified checkpoints
                </p>
              </motion.div>

              <GlassCard className="p-6">
                <Timeline3D milestones={sampleMilestones} currentProgress={75} />
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-800">
              <span className="gradient-text">Featured</span> Projects
            </h2>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">
              Latest infrastructure development projects making a real difference in rural communities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.length > 0 ? featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                Loading featured projects...
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 font-bold hover:bg-sky-100 transition-all duration-300 group"
            >
              View All Projects
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-12 text-center relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-green-600/20" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
                  Ready to Track Your Village's Progress?
                </h2>
                <p className="text-slate-600 font-medium mb-8 max-w-2xl mx-auto">
                  Access real-time information about grants, milestones, and fund utilization in your area.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/citizen"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    Citizen Portal
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all duration-300"
                  >
                    Officer Login
                  </Link>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">RIGMS</h3>
                <p className="text-xs text-slate-500 font-medium">Rural Infrastructure Grant Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <span>© 2025 Government of Maharashtra</span>
              <a href="#" className="hover:text-sky-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
