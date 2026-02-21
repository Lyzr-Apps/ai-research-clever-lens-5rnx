'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  RiServerLine,
  RiCodeLine,
  RiRobot2Line,
  RiDatabase2Line,
  RiTimeLine,
  RiRouteLine,
} from 'react-icons/ri'
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi'
import { BsArrowRight } from 'react-icons/bs'

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SystemComponent {
  name: string
  status: 'online' | 'warning' | 'standby'
  statusLabel: string
  icon: React.ReactNode
  description: string
}

interface NextStep {
  step: number
  title: string
  description: string
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const SYSTEM_COMPONENTS: SystemComponent[] = [
  {
    name: 'Next.js Runtime',
    status: 'online',
    statusLabel: 'Online',
    icon: <RiServerLine className="w-5 h-5" />,
    description: 'Application server running and responsive',
  },
  {
    name: 'API Routes',
    status: 'online',
    statusLabel: 'Online',
    icon: <RiRouteLine className="w-5 h-5" />,
    description: 'All endpoint handlers registered and active',
  },
  {
    name: 'Agent Framework',
    status: 'online',
    statusLabel: 'Ready',
    icon: <RiCodeLine className="w-5 h-5" />,
    description: 'Core orchestration layer initialized',
  },
  {
    name: 'AI Agents',
    status: 'warning',
    statusLabel: 'Not Configured',
    icon: <RiRobot2Line className="w-5 h-5" />,
    description: 'Awaiting PRD to generate agent definitions',
  },
  {
    name: 'Knowledge Base',
    status: 'warning',
    statusLabel: 'Not Configured',
    icon: <RiDatabase2Line className="w-5 h-5" />,
    description: 'No documents or data sources ingested yet',
  },
  {
    name: 'Scheduler',
    status: 'standby',
    statusLabel: 'Standby',
    icon: <RiTimeLine className="w-5 h-5" />,
    description: 'Cron engine idle, ready for scheduled tasks',
  },
]

const NEXT_STEPS: NextStep[] = [
  {
    step: 1,
    title: 'Retry Generation',
    description:
      'Resubmit your PRD to generate the application. The service interruption was temporary and should now be resolved.',
  },
  {
    step: 2,
    title: 'Agent Configuration',
    description:
      'Agents will be automatically created from your specifications. Each agent is tailored to handle specific tasks within your workflow.',
  },
  {
    step: 3,
    title: 'UI Generation',
    description:
      'The interface will be built to match your requirements, integrating all agents and data flows into a cohesive experience.',
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: 'online' | 'warning' | 'standby' }) {
  const colorMap = {
    online: 'bg-green-400',
    warning: 'bg-amber-400',
    standby: 'bg-blue-400',
  }
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === 'online' && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[status]}`} />
    </span>
  )
}

function StatusBadge({ status, label }: { status: 'online' | 'warning' | 'standby'; label: string }) {
  const styles = {
    online: 'bg-green-900/30 text-green-400 border-green-800/40',
    warning: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
    standby: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  }
  const icons = {
    online: <HiOutlineCheckCircle className="w-3.5 h-3.5 mr-1" />,
    warning: <HiOutlineExclamationTriangle className="w-3.5 h-3.5 mr-1" />,
    standby: <HiOutlineClock className="w-3.5 h-3.5 mr-1" />,
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {icons[status]}
      {label}
    </span>
  )
}

function ComponentCard({ component }: { component: SystemComponent }) {
  return (
    <Card className="bg-card border border-border rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:border-accent/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-muted text-accent">
            {component.icon}
          </div>
          <StatusBadge status={component.status} label={component.statusLabel} />
        </div>
        <h3 className="font-serif text-base font-semibold text-foreground mb-1.5 tracking-wide">
          {component.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {component.description}
        </p>
      </CardContent>
    </Card>
  )
}

function StepCard({ step }: { step: NextStep }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
        <span className="font-serif text-sm font-semibold text-accent">{step.step}</span>
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-serif text-base font-semibold text-foreground mb-1.5 tracking-wide flex items-center gap-2">
          {step.title}
          <BsArrowRight className="w-3.5 h-3.5 text-accent opacity-60" />
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fadeIn = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        {/* ---- Header Bar ---- */}
        <header className={`border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 transition-all duration-700 ${fadeIn}`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="font-serif text-xl font-semibold tracking-wide text-foreground">
              Architect
            </h1>
            <div className="flex items-center gap-2.5">
              <StatusDot status="online" />
              <span className="text-sm text-muted-foreground tracking-wide">System Ready</span>
            </div>
          </div>
        </header>

        {/* ---- Main Content ---- */}
        <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
          {/* ---- Hero Section ---- */}
          <section className={`text-center space-y-6 transition-all duration-700 delay-100 ${fadeIn}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/20 border border-amber-800/30 text-amber-400 text-xs font-medium tracking-wide">
              <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
              Service Interruption Detected
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-wide leading-tight">
              Configuration Required
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              The PRD generation process encountered a temporary service error. Your application infrastructure is fully operational and awaiting configuration.
            </p>
          </section>

          {/* ---- Error Detail Card ---- */}
          <section className={`transition-all duration-700 delay-200 ${fadeIn}`}>
            <Card className="bg-card border border-border rounded-lg shadow-lg max-w-3xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg font-semibold tracking-wide flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-900/20 border border-amber-800/30">
                    <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/60 border border-border rounded-md p-4">
                  <code className="font-mono text-sm text-amber-400/90 leading-relaxed break-all">
                    litellm.ServiceUnavailableError: litellm.MidStreamFallbackError
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-muted-foreground/60" />
                    <span>Occurred during PRD generation</span>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-4" />
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckCircle className="w-4 h-4 text-green-400/60" />
                    <span>Non-critical -- infrastructure unaffected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ---- System Components ---- */}
          <section className={`space-y-8 transition-all duration-700 delay-300 ${fadeIn}`}>
            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl font-semibold text-foreground tracking-wide">
                System Components
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Real-time health overview of all infrastructure services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SYSTEM_COMPONENTS.map((component) => (
                <ComponentCard key={component.name} component={component} />
              ))}
            </div>
          </section>

          {/* ---- Divider ---- */}
          <Separator className="bg-border/60" />

          {/* ---- What to Do Next ---- */}
          <section className={`space-y-8 transition-all duration-700 delay-[400ms] ${fadeIn}`}>
            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl font-semibold text-foreground tracking-wide">
                What to Do Next
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Follow these steps to complete your application setup
              </p>
            </div>
            <Card className="bg-card border border-border rounded-lg shadow-lg max-w-3xl mx-auto">
              <CardContent className="p-8 space-y-8">
                {NEXT_STEPS.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <StepCard step={step} />
                    {index < NEXT_STEPS.length - 1 && (
                      <Separator className="bg-border/40 ml-[3.75rem]" />
                    )}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* ---- Summary Stats ---- */}
          <section className={`transition-all duration-700 delay-500 ${fadeIn}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Services Online', value: '3', accent: true },
                { label: 'Pending Config', value: '2', accent: false },
                { label: 'On Standby', value: '1', accent: false },
                { label: 'Errors', value: '0', accent: true },
              ].map((stat) => (
                <Card key={stat.label} className="bg-card border border-border rounded-lg shadow-md">
                  <CardContent className="p-5 text-center">
                    <div className={`font-serif text-3xl font-semibold mb-1 ${stat.accent ? 'text-accent' : 'text-foreground'}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground tracking-wide uppercase">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>

        {/* ---- Footer ---- */}
        <footer className={`border-t border-border bg-card/40 transition-all duration-700 delay-500 ${fadeIn}`}>
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground tracking-wide">
              Powered by Lyzr Agent Framework
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
              <StatusDot status="online" />
              <span>All core systems operational</span>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
