type Entry = {
  title: string;
  date: string;
  role: string;
  body: string;
  tags: string[];
  metric?: string;
  metricLabel?: string;
};
export const stops: {
  name: string;
  kicker: string;
  shortTitle: string;
  summary: string;
  entries: Entry[];
}[] = [
  {
    name: 'Welcome',
    kicker: 'MEET YOUR ENGINEER',
    shortTitle: 'A little about Jaren.',
    summary:
      'A builder at the intersection of backend systems, cloud reliability, and applied AI. Based in Singapore. Always curious.',
    entries: [
      {
        title: 'Connecting the pieces',
        date: 'BACKEND · PLATFORM · AI',
        role: 'Jaren Lim',
        body: 'I work across the stack—from backend APIs and event-driven services to Kubernetes infrastructure and AI workflows. I enjoy turning complicated problems into useful, dependable systems.',
        tags: ['Python', 'TypeScript', 'Go', 'Java'],
      },
      {
        title: 'Singapore Management University',
        date: 'AUG 2024 — EXPECTED SEP 2027',
        role: 'Bachelor of Computing in Information Systems',
        body: 'Working toward a Bachelor of Computing in Information Systems. Projected honours: Magna Cum Laude.',
        tags: ['AWS Certified Solutions Architect – Associate'],
      },
    ],
  },
  {
    name: 'Cloud & reliability',
    kicker: 'INFRASTRUCTURE HEIGHTS',
    shortTitle: 'Built to keep running.',
    summary:
      'Reliable deployments, observable services, and infrastructure that makes engineering teams faster.',
    entries: [
      {
        title: 'NTT DATA Singapore',
        date: 'JUL 2026 — PRESENT · EXPECTED END NOV 2026',
        role: 'Backend Engineer · SRE / Platform Engineering',
        body: 'Operate Kubernetes applications across development and staging, troubleshoot rollouts and connectivity, and build Express.js services. Automated GitLab build and deployment workflows, with observability through Prometheus, Grafana, Datadog, and ELK.',
        metric: '70%+',
        metricLabel: 'reduction in deployment time',
        tags: [
          'Kubernetes',
          'GitLab CI/CD',
          'Express.js',
          'Prometheus',
          'Grafana',
        ],
      },
      {
        title: 'ESMOS Healthcare Portal',
        date: 'APR 2026',
        role: 'Dell Award finalist',
        body: 'Provisioned AWS infrastructure with Terraform across EKS, RDS, EFS, networking, WAF, and backups. Built GitOps deployments using ArgoCD and Helm, with automated security and configuration checks.',
        tags: ['AWS', 'Terraform', 'EKS', 'ArgoCD', 'Helm', 'GitHub Actions'],
      },
    ],
  },
  {
    name: 'Applied AI',
    kicker: 'THE AI WORKSHOP',
    shortTitle: 'From possibility to practical.',
    summary:
      'AI workflows that take hours out of busywork, and recommendation systems that help people find what matters.',
    entries: [
      {
        title: 'KPMG Singapore',
        date: 'MAY 2026 — JUL 2026',
        role: 'GenAI Developer',
        body: 'Built document-processing workflows for invoice extraction, review, and validation using Copilot Studio and Azure AI Foundry. Developed Python and LangChain components and multi-agent workflows for parsing, reasoning, and structured output.',
        metric: '~10 min',
        metricLabel: 'invoice processing, down from 4–5 hours',
        tags: ['Python', 'LangChain', 'Azure AI Foundry', 'Copilot Studio'],
      },
      {
        title: 'SAP Singapore',
        date: 'SEP 2021 — FEB 2022',
        role: 'Machine Learning Engineer',
        body: 'Developed and evaluated a hybrid recommendation system combining GPT-2 with neural collaborative filtering. Improved recommendation performance through feature engineering, embeddings, and iterative tuning.',
        metric: '~5%',
        metricLabel: 'improvement in recommendation performance',
        tags: ['Python', 'GPT-2', 'Machine learning', 'Recommendation systems'],
      },
    ],
  },
  {
    name: 'Backend systems',
    kicker: 'OPERATIONS JUNCTION',
    shortTitle: 'Making complexity click.',
    summary:
      'APIs and scheduling logic that turn real-world constraints into workable everyday tools.',
    entries: [
      {
        title: 'RSAF Agile Innovation Digital',
        date: 'MAY 2023 — AUG 2025',
        role: 'Software Engineer · RAID',
        body: 'Developed NestJS services and REST APIs for automated duty scheduling. Implemented shift coverage, leave, qualification, and fairness constraints to generate feasible rosters. Built Next.js review workflows and Datadog monitoring for incident investigation.',
        tags: [
          'NestJS',
          'Next.js',
          'REST APIs',
          'Constraint-based scheduling',
          'Datadog',
        ],
      },
      {
        title: 'The engineering toolkit',
        date: 'ACROSS THE STACK',
        role: 'Backend · Infrastructure · Data',
        body: 'Experience with Express.js and FastAPI services; PostgreSQL, MongoDB, and SQLite; Docker and Linux; and observability tools including ELK, Loki, and Tempo.',
        tags: ['FastAPI', 'PostgreSQL', 'Docker', 'Linux', 'MongoDB'],
      },
    ],
  },
  {
    name: 'Community impact',
    kicker: 'COMMUNITY CROSSING',
    shortTitle: 'Technology with people in mind.',
    summary:
      'Lumina brings AI and event-driven services together to simplify medical escort and transport coordination.',
    entries: [
      {
        title: 'Lumina',
        date: 'MAY 2026',
        role: 'The Good Hack · Selected for OGP incubation support',
        body: 'Built an AI-powered Medical Escort and Transport coordination platform. Architected FastAPI and Kafka services for subsidy eligibility, provider dispatch, and workflow orchestration. Developed a multilingual voice assistant using Twilio and SEA-LION supporting seven Southeast Asian languages.',
        metric: '40%+',
        metricLabel: 'reduction in manual administrative workflows',
        tags: [
          'React',
          'FastAPI',
          'Kafka',
          'Twilio',
          'SEA-LION',
          '7 languages',
        ],
      },
    ],
  },
  {
    name: 'Say hello',
    kicker: 'THE NEXT CHAPTER',
    shortTitle: 'Where shall we go next?',
    summary:
      'Interested in backend engineering, platform / SRE, and applied AI opportunities. Let’s build something useful.',
    entries: [
      {
        title: 'Let’s connect',
        date: 'SINGAPORE',
        role: 'Backend · Platform / SRE · Applied AI',
        body: 'Have a role, a project, or an interesting engineering problem in mind? I’d be happy to hear about it.',
        tags: [],
      },
    ],
  },
];
