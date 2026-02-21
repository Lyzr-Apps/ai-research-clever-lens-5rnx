'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import {
  RiSearchLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiAddLine,
  RiCloseLine,
  RiFilterLine,
  RiDashboardLine,
  RiCodeLine,
  RiExternalLinkLine,
  RiStarLine,
  RiStarFill,
  RiTimeLine,
  RiDeleteBinLine,
  RiLayoutGridLine,
  RiListUnordered,
  RiFolder3Line,
  RiPriceTag3Line,
  RiLightbulbLine,
  RiBarChartLine,
  RiDatabase2Line,
  RiRobot2Line,
  RiRefreshLine,
  RiMore2Fill,
  RiArrowLeftLine,
  RiArrowRightLine,
} from 'react-icons/ri'
import { FiTrendingUp, FiTarget, FiZap, FiLayers, FiLink } from 'react-icons/fi'
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock, HiOutlineCollection } from 'react-icons/hi'
import { BsGrid3X3Gap, BsListUl } from 'react-icons/bs'
import { VscLibrary } from 'react-icons/vsc'
import { TbMenu2 } from 'react-icons/tb'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const AGENT_ID = '699a2fb82248bbbc86582a33'
const STORAGE_KEY = 'researchhub_items'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ResearchItem {
  id: string
  title: string
  summary: string
  input_type: string
  tags: string[]
  primary_category: string
  sub_categories: string[]
  key_technologies: string[]
  use_cases: string[]
  quality_score: number
  relevance_score: number
  innovation_score: number
  suggested_collections: string[]
  highlights: string[]
  related_topics: string[]
  savedAt: string
  bookmarked: boolean
  userInput?: string
}

type ViewType = 'dashboard' | 'library' | 'collections' | 'bookmarks' | 'tags'

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------
const SAMPLE_ITEMS: ResearchItem[] = [
  {
    id: 'sample-1',
    title: 'Transformer Architecture in Modern NLP',
    summary: 'A comprehensive analysis of the transformer architecture and its evolution from the original "Attention is All You Need" paper to modern large language models. Covers self-attention mechanisms, positional encoding strategies, and scaling laws that govern model performance.',
    input_type: 'article',
    tags: ['NLP', 'transformers', 'deep-learning', 'attention', 'LLM'],
    primary_category: 'Machine Learning',
    sub_categories: ['Natural Language Processing', 'Neural Architecture'],
    key_technologies: ['PyTorch', 'TensorFlow', 'Hugging Face', 'CUDA'],
    use_cases: ['Text Generation', 'Machine Translation', 'Summarization', 'Question Answering'],
    quality_score: 9,
    relevance_score: 10,
    innovation_score: 8,
    suggested_collections: ['AI Fundamentals', 'Deep Learning Papers'],
    highlights: ['Self-attention enables parallel processing of sequences', 'Scaling laws predict model performance', 'Flash Attention reduces memory complexity'],
    related_topics: ['BERT', 'GPT', 'Diffusion Models', 'Mixture of Experts'],
    savedAt: '2026-02-21T10:30:00.000Z',
    bookmarked: true,
    userInput: 'Transformer architecture in modern NLP systems',
  },
  {
    id: 'sample-2',
    title: 'Rust for Systems Programming',
    summary: 'An in-depth guide to using Rust for systems-level programming. Explores memory safety guarantees, zero-cost abstractions, and the ownership model that eliminates data races at compile time. Includes comparisons with C++ and practical migration strategies.',
    input_type: 'topic',
    tags: ['Rust', 'systems-programming', 'memory-safety', 'concurrency', 'performance'],
    primary_category: 'Programming Languages',
    sub_categories: ['Systems Programming', 'Compiler Design'],
    key_technologies: ['Rust', 'LLVM', 'Cargo', 'WebAssembly'],
    use_cases: ['Operating Systems', 'Embedded Systems', 'CLI Tools', 'WebAssembly Modules'],
    quality_score: 8,
    relevance_score: 7,
    innovation_score: 9,
    suggested_collections: ['Language Deep Dives', 'Performance Engineering'],
    highlights: ['Ownership model prevents memory leaks', 'Zero-cost abstractions match C++ performance', 'Cargo ecosystem simplifies dependency management'],
    related_topics: ['C++', 'Go', 'Zig', 'WebAssembly'],
    savedAt: '2026-02-20T14:15:00.000Z',
    bookmarked: false,
    userInput: 'Rust systems programming overview',
  },
  {
    id: 'sample-3',
    title: 'Vector Databases for AI Applications',
    summary: 'Exploring the rise of vector databases in AI-powered applications. Covers embedding storage, approximate nearest neighbor search algorithms, and integration patterns with large language models for retrieval-augmented generation (RAG) architectures.',
    input_type: 'url',
    tags: ['vector-db', 'embeddings', 'RAG', 'search', 'AI-infrastructure'],
    primary_category: 'Data Infrastructure',
    sub_categories: ['Databases', 'Search Systems'],
    key_technologies: ['Pinecone', 'Weaviate', 'Milvus', 'FAISS', 'ChromaDB'],
    use_cases: ['Semantic Search', 'Recommendation Systems', 'RAG Pipelines', 'Anomaly Detection'],
    quality_score: 8,
    relevance_score: 9,
    innovation_score: 7,
    suggested_collections: ['AI Infrastructure', 'Database Technology'],
    highlights: ['HNSW algorithm provides sub-linear search time', 'Hybrid search combines vector and keyword approaches', 'Metadata filtering improves retrieval precision'],
    related_topics: ['Elasticsearch', 'Knowledge Graphs', 'Embedding Models', 'LangChain'],
    savedAt: '2026-02-19T09:45:00.000Z',
    bookmarked: true,
    userInput: 'https://example.com/vector-databases-ai',
  },
  {
    id: 'sample-4',
    title: 'Kubernetes Autoscaling Strategies',
    summary: 'A practical guide to horizontal and vertical pod autoscaling in Kubernetes. Covers custom metrics, KEDA event-driven scaling, and cluster autoscaler configurations for cost-optimized workloads across multi-cloud environments.',
    input_type: 'article',
    tags: ['kubernetes', 'autoscaling', 'cloud-native', 'DevOps', 'infrastructure'],
    primary_category: 'Cloud Infrastructure',
    sub_categories: ['Container Orchestration', 'DevOps'],
    key_technologies: ['Kubernetes', 'KEDA', 'Prometheus', 'Helm', 'ArgoCD'],
    use_cases: ['Microservices Scaling', 'Batch Processing', 'Cost Optimization', 'Multi-tenant Platforms'],
    quality_score: 7,
    relevance_score: 6,
    innovation_score: 6,
    suggested_collections: ['Cloud Native', 'DevOps Best Practices'],
    highlights: ['KEDA enables event-driven pod scaling', 'VPA right-sizes container resource requests', 'Cluster autoscaler responds to pod scheduling failures'],
    related_topics: ['Docker', 'Service Mesh', 'Terraform', 'Serverless'],
    savedAt: '2026-02-18T16:20:00.000Z',
    bookmarked: false,
    userInput: 'Kubernetes autoscaling strategies and best practices',
  },
  {
    id: 'sample-5',
    title: 'Federated Learning: Privacy-Preserving ML',
    summary: 'An exploration of federated learning techniques that enable model training across distributed datasets without centralizing sensitive data. Covers differential privacy, secure aggregation protocols, and real-world deployments in healthcare and finance.',
    input_type: 'topic',
    tags: ['federated-learning', 'privacy', 'distributed-ML', 'healthcare', 'security'],
    primary_category: 'Machine Learning',
    sub_categories: ['Privacy-Preserving ML', 'Distributed Systems'],
    key_technologies: ['TensorFlow Federated', 'PySyft', 'Flower', 'FATE'],
    use_cases: ['Healthcare Analytics', 'Financial Fraud Detection', 'Mobile Keyboard Prediction', 'Cross-Organization Collaboration'],
    quality_score: 9,
    relevance_score: 8,
    innovation_score: 10,
    suggested_collections: ['AI Fundamentals', 'Privacy & Security'],
    highlights: ['Differential privacy adds calibrated noise to protect individuals', 'Secure aggregation prevents server from seeing individual updates', 'Horizontal and vertical FL address different data partitioning scenarios'],
    related_topics: ['Homomorphic Encryption', 'Differential Privacy', 'Edge Computing', 'GDPR Compliance'],
    savedAt: '2026-02-17T11:00:00.000Z',
    bookmarked: true,
    userInput: 'Federated learning privacy preserving machine learning',
  },
]

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
// Helpers
// ---------------------------------------------------------------------------
function getRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    return date.toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'bg-emerald-500/80'
  if (score >= 4) return 'bg-amber-500/80'
  return 'bg-red-400/80'
}

function getScoreTextColor(score: number): string {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 4) return 'text-amber-400'
  return 'text-red-400'
}

function getInputTypeIcon(inputType: string) {
  const type = (inputType || '').toLowerCase()
  if (type.includes('url') || type.includes('link')) return <FiLink className="w-3.5 h-3.5" />
  if (type.includes('repo') || type.includes('github') || type.includes('code')) return <RiCodeLine className="w-3.5 h-3.5" />
  if (type.includes('topic') || type.includes('idea')) return <RiLightbulbLine className="w-3.5 h-3.5" />
  return <RiDatabase2Line className="w-3.5 h-3.5" />
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-semibold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

// ---------------------------------------------------------------------------
// ScoreBar Component
// ---------------------------------------------------------------------------
function ScoreBar({ label, score, compact }: { label: string; score: number; compact?: boolean }) {
  const percentage = (score / 10) * 100
  return (
    <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
      <div className="flex items-center justify-between">
        <span className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</span>
        <span className={`font-mono font-semibold ${compact ? 'text-[10px]' : 'text-xs'} ${getScoreTextColor(score)}`}>{score}/10</span>
      </div>
      <div className={`w-full bg-muted rounded-full overflow-hidden ${compact ? 'h-1' : 'h-1.5'}`}>
        <div className={`h-full rounded-full transition-all duration-500 ${getScoreColor(score)}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ResearchCard Component
// ---------------------------------------------------------------------------
function ResearchCard({
  item,
  onToggleBookmark,
  onSelect,
  viewMode,
}: {
  item: ResearchItem
  onToggleBookmark: (id: string) => void
  onSelect: (item: ResearchItem) => void
  viewMode: 'grid' | 'list'
}) {
  const tags = Array.isArray(item.tags) ? item.tags : []

  if (viewMode === 'list') {
    return (
      <Card className="bg-card border border-border rounded-lg shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300 cursor-pointer" onClick={() => onSelect(item)}>
        <CardContent className="p-4 flex items-start gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-muted text-accent">
            {getInputTypeIcon(item.input_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-serif text-sm font-semibold text-foreground tracking-wide truncate">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">{item.summary}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-accent/15 text-accent border-0">{item.primary_category}</Badge>
                <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id) }} className="p-1 hover:bg-muted rounded-md transition-colors">
                  {item.bookmarked ? <RiBookmarkFill className="w-4 h-4 text-accent" /> : <RiBookmarkLine className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                ))}
                {tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>}
              </div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${getScoreTextColor(item.quality_score)}`}>Q:{item.quality_score}</span>
                <span className={`text-[10px] font-mono ${getScoreTextColor(item.relevance_score)}`}>R:{item.relevance_score}</span>
                <span className={`text-[10px] font-mono ${getScoreTextColor(item.innovation_score)}`}>I:{item.innovation_score}</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><RiTimeLine className="w-3 h-3" />{getRelativeTime(item.savedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border rounded-lg shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300 cursor-pointer flex flex-col" onClick={() => onSelect(item)}>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted text-accent">
              {getInputTypeIcon(item.input_type)}
            </div>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-accent/15 text-accent border-0">{item.primary_category}</Badge>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id) }} className="p-1.5 hover:bg-muted rounded-md transition-colors">
            {item.bookmarked ? <RiBookmarkFill className="w-4 h-4 text-accent" /> : <RiBookmarkLine className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <h3 className="font-serif text-base font-semibold text-foreground tracking-wide mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3 flex-1">{item.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">{tag}</Badge>
          ))}
          {tags.length > 4 && <Badge variant="outline" className="text-[10px] px-2 py-0.5">+{tags.length - 4}</Badge>}
        </div>
        <div className="space-y-1.5">
          <ScoreBar label="Quality" score={item.quality_score} compact />
          <ScoreBar label="Relevance" score={item.relevance_score} compact />
          <ScoreBar label="Innovation" score={item.innovation_score} compact />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><RiTimeLine className="w-3 h-3" />{getRelativeTime(item.savedAt)}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{item.input_type || 'research'}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Detail Dialog Content
// ---------------------------------------------------------------------------
function ItemDetailContent({
  item,
  onToggleBookmark,
  onDelete,
}: {
  item: ResearchItem
  onToggleBookmark: (id: string) => void
  onDelete: (id: string) => void
}) {
  const tags = Array.isArray(item.tags) ? item.tags : []
  const subCategories = Array.isArray(item.sub_categories) ? item.sub_categories : []
  const keyTech = Array.isArray(item.key_technologies) ? item.key_technologies : []
  const useCases = Array.isArray(item.use_cases) ? item.use_cases : []
  const highlights = Array.isArray(item.highlights) ? item.highlights : []
  const collections = Array.isArray(item.suggested_collections) ? item.suggested_collections : []
  const relatedTopics = Array.isArray(item.related_topics) ? item.related_topics : []

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs bg-accent/15 text-accent border-0">{item.primary_category}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{item.input_type || 'research'}</Badge>
          {subCategories.map((sc) => (
            <Badge key={sc} variant="secondary" className="text-[10px]">{sc}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onToggleBookmark(item.id)} className="p-2 hover:bg-muted rounded-md transition-colors">
            {item.bookmarked ? <RiBookmarkFill className="w-5 h-5 text-accent" /> : <RiBookmarkLine className="w-5 h-5 text-muted-foreground" />}
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-destructive/20 rounded-md transition-colors text-muted-foreground hover:text-destructive">
            <RiDeleteBinLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground tracking-wide mb-2">{item.title}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(item.summary)}</div>
      </div>

      <Separator className="bg-border/50" />

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScoreBar label="Quality" score={item.quality_score} />
        <ScoreBar label="Relevance" score={item.relevance_score} />
        <ScoreBar label="Innovation" score={item.innovation_score} />
      </div>

      {keyTech.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-2 flex items-center gap-1.5"><RiCodeLine className="w-3.5 h-3.5 text-accent" /> Key Technologies</h4>
          <div className="flex flex-wrap gap-1.5">
            {keyTech.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs font-mono">{tech}</Badge>
            ))}
          </div>
        </div>
      )}

      {useCases.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-2 flex items-center gap-1.5"><FiTarget className="w-3.5 h-3.5 text-accent" /> Use Cases</h4>
          <ul className="space-y-1">
            {useCases.map((uc) => (
              <li key={uc} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                {uc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {highlights.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-2 flex items-center gap-1.5"><FiZap className="w-3.5 h-3.5 text-accent" /> Highlights</h4>
          <ul className="space-y-1.5">
            {highlights.map((h, idx) => (
              <li key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 leading-relaxed">{h}</li>
            ))}
          </ul>
        </div>
      )}

      {collections.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-2 flex items-center gap-1.5"><RiFolder3Line className="w-3.5 h-3.5 text-accent" /> Suggested Collections</h4>
          <div className="flex flex-wrap gap-1.5">
            {collections.map((c) => (
              <Badge key={c} variant="secondary" className="text-xs bg-accent/10 text-accent border border-accent/20">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      {relatedTopics.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-2 flex items-center gap-1.5"><FiLayers className="w-3.5 h-3.5 text-accent" /> Related Topics</h4>
          <div className="flex flex-wrap gap-1.5">
            {relatedTopics.map((rt) => (
              <Badge key={rt} variant="outline" className="text-xs">{rt}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
        <span className="flex items-center gap-1"><RiTimeLine className="w-3 h-3" />Saved {getRelativeTime(item.savedAt)}</span>
        {item.userInput && <span className="truncate max-w-[200px]">Input: {item.userInput}</span>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Analyze Result Preview
// ---------------------------------------------------------------------------
function AnalyzeResultPreview({ item }: { item: ResearchItem }) {
  const tags = Array.isArray(item.tags) ? item.tags : []
  const keyTech = Array.isArray(item.key_technologies) ? item.key_technologies : []
  const highlights = Array.isArray(item.highlights) ? item.highlights : []
  const collections = Array.isArray(item.suggested_collections) ? item.suggested_collections : []

  return (
    <div className="space-y-4 mt-4 p-4 bg-muted/30 border border-border rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-base font-semibold text-foreground tracking-wide">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] bg-accent/15 text-accent border-0">{item.primary_category}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{item.input_type || 'research'}</Badge>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ScoreBar label="Quality" score={item.quality_score} compact />
        <ScoreBar label="Relevance" score={item.relevance_score} compact />
        <ScoreBar label="Innovation" score={item.innovation_score} compact />
      </div>
      {keyTech.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keyTech.map((tech) => (
            <Badge key={tech} variant="outline" className="text-[10px] font-mono">{tech}</Badge>
          ))}
        </div>
      )}
      {highlights.length > 0 && (
        <div className="space-y-1">
          {highlights.slice(0, 3).map((h, idx) => (
            <p key={idx} className="text-[11px] text-muted-foreground bg-muted/50 rounded px-2 py-1">{h}</p>
          ))}
        </div>
      )}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {collections.map((c) => (
            <Badge key={c} variant="secondary" className="text-[10px] bg-accent/10 text-accent border border-accent/20">{c}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty States
// ---------------------------------------------------------------------------
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-muted/60 text-muted-foreground mb-4">{icon}</div>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 tracking-wide">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading Skeleton for Cards
// ---------------------------------------------------------------------------
function CardSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-lg shadow-lg">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function Page() {
  // State
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<ResearchItem[]>([])
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showSampleData, setShowSampleData] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)

  // Add Research state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [analyzeInput, setAnalyzeInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<ResearchItem | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Save to localStorage when items change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch {
        // ignore storage errors
      }
    }
  }, [items, mounted])

  // Combined items (real + sample when toggle on)
  const displayItems = useMemo(() => {
    if (showSampleData) {
      const sampleIds = new Set(SAMPLE_ITEMS.map((s) => s.id))
      const realItems = items.filter((i) => !sampleIds.has(i.id))
      return [...SAMPLE_ITEMS, ...realItems]
    }
    return items
  }, [items, showSampleData])

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    displayItems.forEach((item) => {
      if (item.primary_category) cats.add(item.primary_category)
    })
    return Array.from(cats).sort()
  }, [displayItems])

  // All unique tags with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    displayItems.forEach((item) => {
      const tags = Array.isArray(item.tags) ? item.tags : []
      tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
    return counts
  }, [displayItems])

  // Collections derived from suggested_collections
  const collectionData = useMemo(() => {
    const colMap: Record<string, ResearchItem[]> = {}
    displayItems.forEach((item) => {
      const collections = Array.isArray(item.suggested_collections) ? item.suggested_collections : []
      collections.forEach((col) => {
        if (!colMap[col]) colMap[col] = []
        colMap[col].push(item)
      })
    })
    return colMap
  }, [displayItems])

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...displayItems]

    // View-specific filters
    if (activeView === 'bookmarks') {
      result = result.filter((item) => item.bookmarked)
    }

    if (activeView === 'tags' && selectedTagFilter) {
      result = result.filter((item) => {
        const tags = Array.isArray(item.tags) ? item.tags : []
        return tags.includes(selectedTagFilter)
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item) => {
        const tags = Array.isArray(item.tags) ? item.tags : []
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.summary || '').toLowerCase().includes(q) ||
          (item.primary_category || '').toLowerCase().includes(q) ||
          tags.some((t) => t.toLowerCase().includes(q))
        )
      })
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.primary_category === selectedCategory)
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    } else if (sortBy === 'quality') {
      result.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    } else if (sortBy === 'relevance') {
      result.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
    } else if (sortBy === 'innovation') {
      result.sort((a, b) => (b.innovation_score || 0) - (a.innovation_score || 0))
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return result
  }, [displayItems, activeView, searchQuery, selectedCategory, sortBy, selectedTagFilter])

  // Stats
  const stats = useMemo(() => {
    const total = displayItems.length
    const avgQuality = total > 0 ? displayItems.reduce((sum, i) => sum + (i.quality_score || 0), 0) / total : 0
    const catCounts: Record<string, number> = {}
    displayItems.forEach((i) => {
      if (i.primary_category) {
        catCounts[i.primary_category] = (catCounts[i.primary_category] || 0) + 1
      }
    })
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]
    const uniqueTags = Object.keys(tagCounts).length
    return {
      total,
      avgQuality: avgQuality.toFixed(1),
      topCategory: topCategory ? topCategory[0] : 'N/A',
      uniqueTags,
      bookmarked: displayItems.filter((i) => i.bookmarked).length,
    }
  }, [displayItems, tagCounts])

  // Toggle bookmark
  const toggleBookmark = useCallback((id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
    // Also check if it is a sample item being shown
    if (showSampleData) {
      const sampleItem = SAMPLE_ITEMS.find((s) => s.id === id)
      if (sampleItem) {
        sampleItem.bookmarked = !sampleItem.bookmarked
      }
    }
  }, [showSampleData])

  // Delete item
  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setDetailOpen(false)
    setSelectedItem(null)
    setStatusMessage('Item removed from library')
    setTimeout(() => setStatusMessage(null), 3000)
  }, [])

  // Open detail
  const openDetail = useCallback((item: ResearchItem) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }, [])

  // Analyze research
  const handleAnalyze = useCallback(async () => {
    if (!analyzeInput.trim()) return

    setAnalyzing(true)
    setAnalyzeResult(null)
    setAnalyzeError(null)
    setActiveAgentId(AGENT_ID)

    try {
      const message = `Analyze the following research input and return a structured JSON response with title, summary, input_type, tags, primary_category, sub_categories, key_technologies, use_cases, quality_score (1-10), relevance_score (1-10), innovation_score (1-10), suggested_collections, highlights, and related_topics: ${analyzeInput.trim()}`

      const result = await callAIAgent(message, AGENT_ID)

      if (result.success) {
        const parsed = parseLLMJson(result.response)
        let data = parsed?.result || parsed

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const newItem: ResearchItem = {
            id: Date.now().toString(),
            title: typeof data.title === 'string' ? data.title : 'Untitled Research',
            summary: typeof data.summary === 'string' ? data.summary : '',
            input_type: typeof data.input_type === 'string' ? data.input_type : 'unknown',
            tags: Array.isArray(data.tags) ? data.tags.filter((t: unknown) => typeof t === 'string') : [],
            primary_category: typeof data.primary_category === 'string' ? data.primary_category : 'Uncategorized',
            sub_categories: Array.isArray(data.sub_categories) ? data.sub_categories.filter((s: unknown) => typeof s === 'string') : [],
            key_technologies: Array.isArray(data.key_technologies) ? data.key_technologies.filter((k: unknown) => typeof k === 'string') : [],
            use_cases: Array.isArray(data.use_cases) ? data.use_cases.filter((u: unknown) => typeof u === 'string') : [],
            quality_score: typeof data.quality_score === 'number' ? data.quality_score : 0,
            relevance_score: typeof data.relevance_score === 'number' ? data.relevance_score : 0,
            innovation_score: typeof data.innovation_score === 'number' ? data.innovation_score : 0,
            suggested_collections: Array.isArray(data.suggested_collections) ? data.suggested_collections.filter((c: unknown) => typeof c === 'string') : [],
            highlights: Array.isArray(data.highlights) ? data.highlights.filter((h: unknown) => typeof h === 'string') : [],
            related_topics: Array.isArray(data.related_topics) ? data.related_topics.filter((r: unknown) => typeof r === 'string') : [],
            savedAt: new Date().toISOString(),
            bookmarked: false,
            userInput: analyzeInput.trim(),
          }
          setAnalyzeResult(newItem)
        } else {
          setAnalyzeError('The agent returned an unexpected response format. Please try again.')
        }
      } else {
        setAnalyzeError(result.error || 'Analysis failed. Please try again.')
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setAnalyzing(false)
      setActiveAgentId(null)
    }
  }, [analyzeInput])

  // Save analyzed result
  const saveAnalyzedResult = useCallback(() => {
    if (analyzeResult) {
      setItems((prev) => [analyzeResult, ...prev])
      setAnalyzeResult(null)
      setAnalyzeInput('')
      setAddDialogOpen(false)
      setStatusMessage('Research saved to library')
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }, [analyzeResult])

  // Nav items
  const navItems: { key: ViewType; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <RiDashboardLine className="w-4 h-4" /> },
    { key: 'library', label: 'Library', icon: <VscLibrary className="w-4 h-4" /> },
    { key: 'collections', label: 'Collections', icon: <RiFolder3Line className="w-4 h-4" /> },
    { key: 'bookmarks', label: 'Bookmarks', icon: <RiBookmarkLine className="w-4 h-4" /> },
    { key: 'tags', label: 'Tags', icon: <RiPriceTag3Line className="w-4 h-4" /> },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-32 mx-auto rounded" />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Dashboard View
  // ---------------------------------------------------------------------------
  function DashboardView() {
    const recentItems = [...displayItems].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).slice(0, 5)
    const topTagEntries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)
    const collectionNames = Object.keys(collectionData).slice(0, 6)

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground tracking-wide mb-1">Dashboard</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Your research at a glance</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent/15"><RiDatabase2Line className="w-5 h-5 text-accent" /></div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-foreground">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Total Research</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/15"><FiTrendingUp className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-foreground">{stats.avgQuality}</p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Avg Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/15"><FiLayers className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground truncate">{stats.topCategory}</p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Top Category</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/15"><RiPriceTag3Line className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-foreground">{stats.uniqueTags}</p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Unique Tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Additions */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground tracking-wide mb-3 flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-accent" /> Recent Additions
          </h3>
          {recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentItems.map((item) => (
                <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="grid" />
              ))}
            </div>
          ) : (
            <EmptyState icon={<RiDatabase2Line className="w-8 h-8" />} title="No research yet" description="Add your first research item to get started. Analyze URLs, topics, or any research material." />
          )}
        </div>

        {/* Tag Cloud & Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-semibold tracking-wide flex items-center gap-2">
                <RiPriceTag3Line className="w-4 h-4 text-accent" /> Tag Cloud
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTagEntries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topTagEntries.map(([tag, count]) => (
                    <button key={tag} onClick={() => { setSelectedTagFilter(tag); setActiveView('tags') }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs hover:bg-accent/20 hover:text-accent transition-colors">
                      {tag}
                      <span className="text-[10px] text-muted-foreground">({count})</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Tags will appear here as you add research.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border border-border rounded-lg shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-semibold tracking-wide flex items-center gap-2">
                <RiFolder3Line className="w-4 h-4 text-accent" /> Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {collectionNames.length > 0 ? (
                <div className="space-y-2">
                  {collectionNames.map((name) => {
                    const colItems = collectionData[name] || []
                    const avgScore = colItems.length > 0 ? (colItems.reduce((s, i) => s + (i.quality_score || 0), 0) / colItems.length).toFixed(1) : '0'
                    return (
                      <button key={name} onClick={() => setActiveView('collections')} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-left">
                        <div className="flex items-center gap-2">
                          <RiFolder3Line className="w-4 h-4 text-accent" />
                          <span className="text-sm text-foreground font-medium">{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{colItems.length} items</span>
                          <Badge variant="secondary" className="text-[10px]">{avgScore}</Badge>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Collections auto-generate from AI analysis suggestions.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Library View
  // ---------------------------------------------------------------------------
  function LibraryView() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground tracking-wide mb-1">Library</h2>
            <p className="text-sm text-muted-foreground">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:bg-muted'}`}>
              <BsGrid3X3Gap className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:bg-muted'}`}>
              <BsListUl className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by title, tag, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-input border-border focus:ring-accent" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-input border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px] bg-input border-border">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="quality">Quality Score</SelectItem>
              <SelectItem value="relevance">Relevance Score</SelectItem>
              <SelectItem value="innovation">Innovation Score</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items */}
        {filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="list" />
              ))}
            </div>
          )
        ) : (
          <EmptyState icon={<RiSearchLine className="w-8 h-8" />} title={searchQuery ? 'No matches found' : 'Library is empty'} description={searchQuery ? 'Try adjusting your search terms or filters.' : 'Start by analyzing your first research item.'} />
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Collections View
  // ---------------------------------------------------------------------------
  function CollectionsView() {
    const collectionNames = Object.keys(collectionData).sort()

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground tracking-wide mb-1">Collections</h2>
          <p className="text-sm text-muted-foreground">Auto-grouped by AI analysis suggestions</p>
        </div>

        {collectionNames.length > 0 ? (
          <div className="space-y-6">
            {collectionNames.map((name) => {
              const colItems = collectionData[name] || []
              const avgScore = colItems.length > 0 ? (colItems.reduce((s, i) => s + (i.quality_score || 0), 0) / colItems.length).toFixed(1) : '0'
              return (
                <Card key={name} className="bg-card border border-border rounded-lg shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-base font-semibold tracking-wide flex items-center gap-2">
                        <RiFolder3Line className="w-4 h-4 text-accent" />
                        {name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{colItems.length} items</Badge>
                        <Badge variant="outline" className="text-xs">Avg: {avgScore}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {colItems.slice(0, 6).map((item) => (
                        <div key={item.id} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer" onClick={() => openDetail(item)}>
                          <h4 className="text-sm font-semibold text-foreground truncate mb-1">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{item.summary}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.primary_category}</Badge>
                            <span className={`text-[10px] font-mono ${getScoreTextColor(item.quality_score)}`}>Q:{item.quality_score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {colItems.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">+{colItems.length - 6} more items</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={<RiFolder3Line className="w-8 h-8" />} title="No collections yet" description="Collections are auto-generated from AI analysis. Add research items to see them organized into collections." />
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Bookmarks View
  // ---------------------------------------------------------------------------
  function BookmarksView() {
    const bookmarkedItems = filteredItems.filter((i) => i.bookmarked)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground tracking-wide mb-1">Bookmarks</h2>
            <p className="text-sm text-muted-foreground">{bookmarkedItems.length} bookmarked item{bookmarkedItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:bg-muted'}`}>
              <BsGrid3X3Gap className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:bg-muted'}`}>
              <BsListUl className="w-4 h-4" />
            </button>
          </div>
        </div>

        {bookmarkedItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bookmarkedItems.map((item) => (
                <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedItems.map((item) => (
                <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="list" />
              ))}
            </div>
          )
        ) : (
          <EmptyState icon={<RiBookmarkLine className="w-8 h-8" />} title="No bookmarks yet" description="Bookmark research items to save them here for quick access." />
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Tags View
  // ---------------------------------------------------------------------------
  function TagsView() {
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])
    const tagFilteredItems = selectedTagFilter ? displayItems.filter((item) => {
      const tags = Array.isArray(item.tags) ? item.tags : []
      return tags.includes(selectedTagFilter)
    }) : []

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground tracking-wide mb-1">Tags</h2>
          <p className="text-sm text-muted-foreground">{sortedTags.length} unique tag{sortedTags.length !== 1 ? 's' : ''} across your research</p>
        </div>

        {sortedTags.length > 0 ? (
          <div className="space-y-6">
            <Card className="bg-card border border-border rounded-lg shadow-lg">
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map(([tag, count]) => (
                    <button key={tag} onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${selectedTagFilter === tag ? 'bg-accent text-white shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-accent/20 hover:text-accent'}`}>
                      <RiPriceTag3Line className="w-3 h-3" />
                      {tag}
                      <span className={`text-[10px] ${selectedTagFilter === tag ? 'text-white/70' : 'text-muted-foreground'}`}>({count})</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedTagFilter && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-semibold text-foreground tracking-wide">
                    Items tagged "{selectedTagFilter}" ({tagFilteredItems.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTagFilter(null)} className="text-muted-foreground text-xs">
                    <RiCloseLine className="w-4 h-4 mr-1" /> Clear filter
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagFilteredItems.map((item) => (
                    <ResearchCard key={item.id} item={item} onToggleBookmark={toggleBookmark} onSelect={openDetail} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={<RiPriceTag3Line className="w-8 h-8" />} title="No tags yet" description="Tags are auto-generated when you analyze research items." />
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[280px] bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent/15">
                  <VscLibrary className="w-5 h-5 text-accent" />
                </div>
                <h1 className="font-serif text-xl font-semibold text-foreground tracking-wide">ResearchHub</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-muted rounded-md">
                <RiCloseLine className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="px-4 mb-4 flex-shrink-0">
            <Button onClick={() => { setAddDialogOpen(true); setSidebarOpen(false) }} className="w-full bg-accent hover:bg-accent/90 text-white font-semibold">
              <RiAddLine className="w-4 h-4 mr-2" /> New Research
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
            <nav className="space-y-1 px-2">
              {navItems.map((navItem) => (
                <button key={navItem.key} onClick={() => { setActiveView(navItem.key); setSidebarOpen(false); if (navItem.key !== 'tags') setSelectedTagFilter(null) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${activeView === navItem.key ? 'bg-accent/15 text-accent font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  {navItem.icon}
                  <span className="tracking-wide">{navItem.label}</span>
                  {navItem.key === 'bookmarks' && stats.bookmarked > 0 && (
                    <span className="ml-auto text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">{stats.bookmarked}</span>
                  )}
                  {navItem.key === 'library' && stats.total > 0 && (
                    <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{stats.total}</span>
                  )}
                </button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tags</span>
                <span className="text-foreground font-semibold">{stats.uniqueTags}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="text-foreground font-semibold">{stats.avgQuality}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-md">
                <TbMenu2 className="w-5 h-5 text-foreground" />
              </button>
              <span className="font-serif text-sm font-semibold text-foreground tracking-wide lg:hidden">ResearchHub</span>
            </div>

            <div className="flex items-center gap-3">
              {statusMessage && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                  {statusMessage}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
              {activeView === 'dashboard' && <DashboardView />}
              {activeView === 'library' && <LibraryView />}
              {activeView === 'collections' && <CollectionsView />}
              {activeView === 'bookmarks' && <BookmarksView />}
              {activeView === 'tags' && <TagsView />}
            </div>
          </div>

          {/* Agent Status Footer */}
          <footer className="border-t border-border bg-card/40 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground tracking-wide">Research Analyzer Agent</span>
              {activeAgentId ? (
                <span className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">{AGENT_ID}</span>
          </footer>
        </main>

        {/* Add Research Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) { setAnalyzeResult(null); setAnalyzeError(null) } }}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-semibold tracking-wide flex items-center gap-2">
                <RiAddLine className="w-5 h-5 text-accent" />
                New Research
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter a URL, topic, GitHub repo, or description to analyze.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="analyze-input" className="text-xs text-muted-foreground mb-1.5 block">Research Input</Label>
                <Textarea id="analyze-input" placeholder="Paste a URL, describe a topic, or enter a GitHub repository link..." value={analyzeInput} onChange={(e) => setAnalyzeInput(e.target.value)} rows={4} className="bg-input border-border focus:ring-accent resize-none" disabled={analyzing} />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleAnalyze} disabled={analyzing || !analyzeInput.trim()} className="bg-accent hover:bg-accent/90 text-white font-semibold">
                  {analyzing ? (
                    <>
                      <RiRefreshLine className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
                {analyzeResult && (
                  <Button onClick={saveAnalyzedResult} variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 font-semibold">
                    <RiDatabase2Line className="w-4 h-4 mr-2" />
                    Save to Library
                  </Button>
                )}
              </div>

              {analyzing && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RiRefreshLine className="w-4 h-4 animate-spin text-accent" />
                    AI agent is analyzing your research input...
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                    <div className="flex gap-1.5 mt-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {analyzeError && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-destructive font-semibold">Analysis Failed</p>
                      <p className="text-xs text-destructive/80 mt-1">{analyzeError}</p>
                      <Button variant="ghost" size="sm" onClick={handleAnalyze} className="mt-2 text-destructive text-xs">
                        <RiRefreshLine className="w-3 h-3 mr-1" /> Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {analyzeResult && <AnalyzeResultPreview item={analyzeResult} />}
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-semibold tracking-wide">
                Research Detail
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Full analysis and metadata
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <ItemDetailContent item={selectedItem} onToggleBookmark={(id) => { toggleBookmark(id); setSelectedItem((prev) => prev ? { ...prev, bookmarked: !prev.bookmarked } : null) }} onDelete={deleteItem} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
