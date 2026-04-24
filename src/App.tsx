/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRightLeft,
  BrainCircuit,
  Cpu,
  Database,
  Download,
  FileText,
  Info,
  Languages,
  Network,
  PlugZap,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import {
  DEFAULT_SELECTION,
  REQUIREMENT_GROUP_LABELS,
  REQUIREMENT_OPTIONS,
} from './constants';
import { evaluateArchitecture } from './ruleEngine';
import {
  ArchitectureProfileDefinition,
  BilingualText,
  Language,
  LayerComponents,
  RequirementGroupId,
  RequirementId,
  RequirementSelection,
  RuleTrace,
} from './types';

const GROUP_ORDER: RequirementGroupId[] = ['operational', 'data', 'integration', 'advanced'];
type ResilienceStatus = 'defined' | 'partial' | 'pending';

interface OperationalControl {
  id: 'backup' | 'restore' | 'firmware' | 'updatePolicy';
  label: BilingualText;
  action: BilingualText;
}

function text(value: BilingualText, language: Language): string {
  return value[language];
}

function levelBadgeClass(level: string): string {
  if (level === 'Low') {
    return 'level-low';
  }
  if (level === 'Medium') {
    return 'level-medium';
  }
  return 'level-high';
}

function normalizeSources(profile: ArchitectureProfileDefinition): string {
  const values = [
    ...profile.layers.ot,
    ...profile.layers.edge,
    ...(profile.layers.integration ?? []),
    ...profile.layers.data,
    ...profile.layers.security,
    ...profile.baseline.minimum.security,
    ...profile.baseline.reinforced.security,
  ];
  return values.join(' ').toLowerCase();
}

function includesAny(source: string, keywords: string[]): boolean {
  return keywords.some((keyword) => source.includes(keyword));
}

function resilienceStatusClass(status: ResilienceStatus): string {
  if (status === 'defined') {
    return 'res-status-defined';
  }
  if (status === 'partial') {
    return 'res-status-partial';
  }
  return 'res-status-pending';
}

function resilienceStatusLabel(status: ResilienceStatus, language: Language): string {
  const labels: Record<ResilienceStatus, BilingualText> = {
    defined: { es: 'Definido', en: 'Defined' },
    partial: { es: 'Parcial', en: 'Partial' },
    pending: { es: 'Pendiente', en: 'Pending' },
  };
  return text(labels[status], language);
}

function buildOperationalControls(_profile: ArchitectureProfileDefinition): OperationalControl[] {
  return [
    {
      id: 'backup',
      label: { es: 'Gestión de backups', en: 'Backup management' },
      action: {
        es: 'Asegurar backup de PLC, HMI, router/gateway y configuraciones críticas de red.',
        en: 'Ensure backups for PLC, HMI, router/gateway and critical network configurations.',
      },
    },
    {
      id: 'restore',
      label: { es: 'Pruebas de recuperación', en: 'Recovery testing' },
      action: {
        es: 'Definir frecuencia de pruebas de restore y documentar el resultado esperado por activo.',
        en: 'Define restore test cadence and document expected outcomes per asset.',
      },
    },
    {
      id: 'firmware',
      label: { es: 'Control de versiones/Hardening', en: 'Version control/Hardening' },
      action: {
        es: 'Mantener inventario de versiones de firmware y una baseline aprobada para dispositivos de red.',
        en: 'Maintain firmware version inventory and an approved baseline for network devices.',
      },
    },
    {
      id: 'updatePolicy',
      label: { es: 'Gestión de cambios', en: 'Change management' },
      action: {
        es: 'Documentar ventanas de mantenimiento, procesos de aprobación previa y planes de rollback.',
        en: 'Document maintenance windows, pre-approval processes, and rollback plans.',
      },
    },
  ];
}

function buildExecutiveMarkdown(
  language: Language,
  selectedProfile: ArchitectureProfileDefinition,
  alternativeProfile: ArchitectureProfileDefinition | null,
  capabilities: string[],
  traces: RuleTrace[],
): string {
  const primaryTitle = text(selectedProfile.title, language);
  const primarySummary = text(selectedProfile.summary, language);
  const primaryRule = text(selectedProfile.keyRule, language);
  const primaryRisk = text(selectedProfile.mainRisk, language);
  const executive = text(selectedProfile.executiveSummary, language);

  const altTitle = alternativeProfile ? text(alternativeProfile.title, language) : 'N/A';
  const altSummary = alternativeProfile ? text(alternativeProfile.summary, language) : 'N/A';

  const traceRows = traces
    .slice(0, 25)
    .map((trace) => `- [${trace.stage}] ${text(trace.message, language)} (${trace.impact})`)
    .join('\n');

  const layerLines = [
    `- OT: ${selectedProfile.layers.ot.join(', ')}`,
    `- Edge: ${selectedProfile.layers.edge.join(', ')}`,
    `- Integration: ${(selectedProfile.layers.integration ?? ['N/A']).join(', ')}`,
    `- Data/Cloud: ${selectedProfile.layers.data.join(', ')}`,
    `- Security: ${selectedProfile.layers.security.join(', ')}`,
  ].join('\n');

  const minimumLines = [
    `- OT: ${selectedProfile.baseline.minimum.ot.join(', ')}`,
    `- Edge: ${selectedProfile.baseline.minimum.edge.join(', ')}`,
    `- Integration: ${(selectedProfile.baseline.minimum.integration ?? ['N/A']).join(', ')}`,
    `- Data/Cloud: ${selectedProfile.baseline.minimum.data.join(', ')}`,
    `- Security: ${selectedProfile.baseline.minimum.security.join(', ')}`,
  ].join('\n');

  const reinforcedLines = [
    `- OT: ${selectedProfile.baseline.reinforced.ot.join(', ')}`,
    `- Edge: ${selectedProfile.baseline.reinforced.edge.join(', ')}`,
    `- Integration: ${(selectedProfile.baseline.reinforced.integration ?? ['N/A']).join(', ')}`,
    `- Data/Cloud: ${selectedProfile.baseline.reinforced.data.join(', ')}`,
    `- Security: ${selectedProfile.baseline.reinforced.security.join(', ')}`,
  ].join('\n');

  const securityLines = selectedProfile.layers.security.map((item) => `- ${item}`).join('\n');
  const resilienceLines = buildOperationalControls(selectedProfile)
    .map((control) => `- [ ] ${text(control.label, language)}: ${text(control.action, language)}`)
    .join('\n');

  const header =
    language === 'es'
      ? '# CIBMAQ - Resumen ejecutivo de arquitectura\n\n'
      : '# CIBMAQ - Architecture executive summary\n\n';

  return (
    header +
    `## Arquitectura principal / Primary architecture\n` +
    `- Perfil: ${primaryTitle} (${selectedProfile.id})\n` +
    `- Resumen: ${primarySummary}\n` +
    `- Regla clave: ${primaryRule}\n` +
    `- Riesgo principal: ${primaryRisk}\n` +
    `- Referencia OEM: ${selectedProfile.oemReference ?? 'N/A'}\n` +
    `- Trazabilidad matriz: ${selectedProfile.matrixTrace}\n\n` +
    `## Alternativa de comparacion / Comparison alternative\n` +
    `- Perfil: ${altTitle}\n` +
    `- Resumen: ${altSummary}\n\n` +
    `## Capacidades activas / Active capabilities\n` +
    `${capabilities.map((item) => `- ${item}`).join('\n')}\n\n` +
    `## Componentes por capa / Components by layer\n` +
    `${layerLines}\n\n` +
    `## Baseline minimo / Minimum baseline\n` +
    `${minimumLines}\n\n` +
    `## Recomendado reforzado / Reinforced recommendation\n` +
    `${reinforcedLines}\n\n` +
    `## Cybersecurity priority controls\n` +
    `${securityLines}\n\n` +
    `## Required operational controls\n` +
    `${resilienceLines}\n\n` +
    `- Complejidad / Complexity: ${selectedProfile.tradeOffs.complexity}\n` +
    `- Costo relativo / Relative cost: ${selectedProfile.tradeOffs.relativeCost}\n` +
    `- Carga operativa / Operational load: ${selectedProfile.tradeOffs.operationalLoad}\n\n` +
    `## Executive statement\n` +
    `${executive}\n\n` +
    `## Explain decision\n` +
    `${traceRows}\n\n` +
    `---\n` +
    `Generated by CIBMAQ Professional Architecture Configurator`
  );
}

function DiagramLayer({
  title,
  items,
  kind,
}: {
  title: string;
  items: string[];
  kind: 'ot' | 'edge' | 'integration' | 'data' | 'security';
}) {
  const icon =
    kind === 'ot' ? <Cpu size={16} /> : kind === 'edge' ? <Network size={16} /> : kind === 'integration' ? <ArrowRightLeft size={16} /> : kind === 'data' ? <Database size={16} /> : <ShieldCheck size={16} />;

  return (
    <div className={`diagram-layer layer-${kind}`}>
      <div className="diagram-layer-title">
        {icon}
        <span>{title}</span>
      </div>
      <div className="diagram-layer-list">
        {items.map((item) => (
          <div key={`${kind}-${item}`} className="diagram-node">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function LayeredArchitectureDiagram({ profile, language }: { profile: ArchitectureProfileDefinition; language: Language }) {
  const layers = [
    {
      key: 'ot' as const,
      title: language === 'es' ? 'Capa OT' : 'OT Layer',
      items: profile.layers.ot,
    },
    {
      key: 'edge' as const,
      title: language === 'es' ? 'Capa Edge' : 'Edge Layer',
      items: profile.layers.edge,
    },
    ...(profile.layers.integration
      ? [
          {
            key: 'integration' as const,
            title: language === 'es' ? 'Capa intermedia (DMZ)' : 'Intermediate layer (DMZ)',
            items: profile.layers.integration,
          },
        ]
      : []),
    {
      key: 'data' as const,
      title: language === 'es' ? 'Datos/Cloud' : 'Data/Cloud',
      items: profile.layers.data,
    },
    {
      key: 'security' as const,
      title: language === 'es' ? 'Controles de seguridad' : 'Security controls',
      items: profile.layers.security,
    },
  ];

  return (
    <div className="diagram-wrap">
      <div className="diagram-shell">
        {layers.map((layer, index) => (
          <React.Fragment key={layer.key}>
            <DiagramLayer title={layer.title} items={layer.items} kind={layer.key} />
            {index < layers.length - 1 && <div className="diagram-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function GroupIcon({ group }: { group: RequirementGroupId }) {
  if (group === 'operational') {
    return <Wrench size={18} />;
  }
  if (group === 'data') {
    return <Database size={18} />;
  }
  if (group === 'integration') {
    return <PlugZap size={18} />;
  }
  return <BrainCircuit size={18} />;
}

const RequirementCard: React.FC<{
  language: Language;
  id: RequirementId;
  selected: boolean;
  onToggle: (requirementId: RequirementId) => void;
}> = ({
  language,
  id,
  selected,
  onToggle,
}) => {
  const option = REQUIREMENT_OPTIONS.find((item) => item.id === id);
  if (!option) {
    return null;
  }

  return (
    <button
      type="button"
      className={`requirement-card ${selected ? 'selected' : ''}`}
      onClick={() => onToggle(id)}
      title={`${text(option.tooltip, language)} | ${option.matrixTrace}`}
    >
      <div className="requirement-title-row">
        <span className="requirement-dot" />
        <h4>{text(option.label, language)}</h4>
      </div>
      <p>{text(option.description, language)}</p>
      <div className="requirement-meta">
        <Info size={12} />
        <span>{option.matrixTrace}</span>
      </div>
    </button>
  );
};

function LayerBreakdown({ language, title, layers }: { language: Language; title: string; layers: LayerComponents }) {
  return (
    <div className="layer-breakdown-card">
      <h4>{title}</h4>
      <div className="layer-breakdown-grid">
        <div>
          <strong>{language === 'es' ? 'OT' : 'OT'}</strong>
          <ul>{layers.ot.map((item) => <li key={`ot-${title}-${item}`}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>Edge</strong>
          <ul>{layers.edge.map((item) => <li key={`edge-${title}-${item}`}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>{language === 'es' ? 'Integracion' : 'Integration'}</strong>
          <ul>{(layers.integration ?? ['N/A']).map((item) => <li key={`int-${title}-${item}`}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>{language === 'es' ? 'Datos/Cloud' : 'Data/Cloud'}</strong>
          <ul>{layers.data.map((item) => <li key={`data-${title}-${item}`}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>{language === 'es' ? 'Seguridad' : 'Security'}</strong>
          <ul>{layers.security.map((item) => <li key={`sec-${title}-${item}`}>{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState<Language>('es');
  const [selection, setSelection] = useState<RequirementSelection>(DEFAULT_SELECTION);

  const exportRef = useRef<HTMLDivElement>(null);

  const groupedRequirements = useMemo(() => {
    const map = new Map<RequirementGroupId, RequirementId[]>();
    for (const group of GROUP_ORDER) {
      map.set(group, []);
    }
    for (const option of REQUIREMENT_OPTIONS) {
      map.get(option.group)?.push(option.id);
    }
    return map;
  }, []);

  const decision = useMemo(() => evaluateArchitecture(selection), [selection]);
  const activeNeeds = useMemo(
    () =>
      REQUIREMENT_OPTIONS
        .filter((option) => decision.normalizedSelection[option.id])
        .map((option) => text(option.label, language)),
    [decision.normalizedSelection, language],
  );

  const toggleRequirement = (requirementId: RequirementId) => {
    setSelection((previous) => {
      const next = { ...previous, [requirementId]: !previous[requirementId] };

      if (requirementId === 'localOnly' && next.localOnly) {
        return {
          ...DEFAULT_SELECTION,
          localOnly: true,
        };
      }

      if (requirementId !== 'localOnly' && next[requirementId]) {
        next.localOnly = false;
      }

      if (requirementId === 'aiAnalytics' && !next.aiAnalytics) {
        next.aiControlValidated = false;
      }

      const hasConnectivityNeed = Object.entries(next).some(([key, value]) => key !== 'localOnly' && value);
      if (!hasConnectivityNeed) {
        next.localOnly = true;
      }

      return next;
    });
  };

  const exportMarkdown = () => {
    const markdown = buildExecutiveMarkdown(
      language,
      decision.primary.profile,
      decision.alternative?.profile ?? null,
      decision.capabilities,
      decision.explain.traces,
    );

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${decision.primary.profile.id}-executive-architecture.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = async () => {
    if (!exportRef.current) {
      return;
    }

    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#060c17',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${decision.primary.profile.id}-diagram-executive.png`;
      link.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to export PNG', error);
    }
  };

  const primaryProfile = decision.primary.profile;
  const operationalControls = useMemo(() => buildOperationalControls(primaryProfile), [primaryProfile]);

  return (
    <div className="app-shell">
      <header className="hero-header">
        <div>
          <p className="kicker">CIBMAQ Industrial Decision Studio</p>
          <h1>Professional Architecture Configurator</h1>
          <p className="subtitle">
            {language === 'es'
              ? 'Motor auditable de seleccion A0-A7 con perfiles compuestos, comparacion y exportes ejecutivos.'
              : 'Auditable A0-A7 selection engine with composite profiles, comparison, and executive exports.'}
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`lang-button ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
          >
            <Languages size={16} /> ES
          </button>
          <button
            type="button"
            className={`lang-button ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            <Languages size={16} /> EN
          </button>
        </div>
      </header>

      <main className="main-flow">
        <motion.section
          className="flow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="section-title">
            <span className="section-index">00</span>
            <div className="section-header-text">
              <h2>{language === 'es' ? 'Salida tecnica' : 'Technical Output'}</h2>
              <p>
                {language === 'es'
                  ? 'Vista principal de arquitectura por capas y controles de ciberseguridad.'
                  : 'Main architecture-by-layer view with cybersecurity controls.'}
              </p>
            </div>
            <div className="export-actions">
              <button type="button" className="action-button" onClick={exportMarkdown}>
                <FileText size={14} /> Markdown
              </button>
              <button type="button" className="action-button" onClick={exportPng}>
                <Download size={14} /> PNG
              </button>
            </div>
          </div>

          <div ref={exportRef} className="export-capture">
            <div className="executive-snapshot">
              <h3>{text(primaryProfile.title, language)}</h3>
              <p>{text(primaryProfile.executiveSummary, language)}</p>
              <div className="snapshot-tags">
                <span>{primaryProfile.id}</span>
                <span>{primaryProfile.matrixTrace}</span>
              </div>
            </div>
            <LayeredArchitectureDiagram profile={primaryProfile} language={language} />
          </div>

          <div className="technical-grid">
            <LayerBreakdown
              language={language}
              title={language === 'es' ? 'Baseline minimo viable' : 'Minimum viable baseline'}
              layers={primaryProfile.baseline.minimum}
            />
            <LayerBreakdown
              language={language}
              title={language === 'es' ? 'Recomendado reforzado' : 'Reinforced recommendation'}
              layers={primaryProfile.baseline.reinforced}
            />
          </div>

          <div className="blueprint-card compact-focus-card">
            <h3>
              <ShieldCheck size={16} />
              {language === 'es' ? 'Foco ciber de la arquitectura' : 'Architecture cybersecurity focus'}
            </h3>
            <div className="compact-focus-grid">
              <article>
                <h4>{language === 'es' ? 'Regla clave' : 'Key rule'}</h4>
                <p>{text(primaryProfile.keyRule, language)}</p>
              </article>
              <article>
                <h4>{language === 'es' ? 'Riesgo principal' : 'Main risk'}</h4>
                <p>{text(primaryProfile.mainRisk, language)}</p>
              </article>
              <article>
                <h4>{language === 'es' ? 'Controles prioritarios' : 'Priority controls'}</h4>
                <ul>
                  {primaryProfile.layers.security.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>{language === 'es' ? 'Niveles operativos' : 'Operational levels'}</h4>
                <div className="metrics-column">
                  <span className={levelBadgeClass(primaryProfile.tradeOffs.complexity)}>
                    {language === 'es' ? 'Complejidad' : 'Complexity'}: {primaryProfile.tradeOffs.complexity}
                  </span>
                  <span className={levelBadgeClass(primaryProfile.tradeOffs.relativeCost)}>
                    {language === 'es' ? 'Costo relativo' : 'Relative cost'}: {primaryProfile.tradeOffs.relativeCost}
                  </span>
                  <span className={levelBadgeClass(primaryProfile.tradeOffs.operationalLoad)}>
                    {language === 'es' ? 'Carga operativa' : 'Operational load'}: {primaryProfile.tradeOffs.operationalLoad}
                  </span>
                </div>
              </article>
            </div>
          </div>

          <div className="resilience-card">
            <h3>
              <Wrench size={16} />
              {language === 'es' ? 'Controles operativos requeridos' : 'Required operational controls'}
            </h3>
            <p className="resilience-caption">
              {language === 'es'
                ? 'Acciones obligatorias de resiliencia y gobierno para garantizar la continuidad del diseño.'
                : 'Mandatory resilience and governance actions to ensure design continuity.'}
            </p>
            <div className="resilience-grid">
              {operationalControls.map((control) => (
                <article key={control.id} className="resilience-item">
                  <div className="resilience-item-top">
                    <h4>{text(control.label, language)}</h4>
                    <span className="resilience-dot-active" />
                  </div>
                  <p className="resilience-action-text">{text(control.action, language)}</p>
                </article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="flow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="section-title">
            <span className="section-index">01</span>
            <div className="section-header-text">
              <h2>{language === 'es' ? 'Necesidades del usuario' : 'User Needs'}</h2>
              <p>
                {language === 'es'
                  ? 'Captura de necesidades por bloques funcionales con trazabilidad a la matriz CIBMAQ.'
                  : 'Need capture by functional blocks with traceability to the CIBMAQ matrix.'}
              </p>
            </div>
          </div>

          <div className="requirement-groups-grid">
            {GROUP_ORDER.map((group, groupIndex) => (
              <motion.div
                key={group}
                className="group-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * groupIndex, duration: 0.3 }}
              >
                <div className="group-card-header">
                  <GroupIcon group={group} />
                  <div>
                    <h3>{text(REQUIREMENT_GROUP_LABELS[group], language)}</h3>
                    <span>{group.toUpperCase()}</span>
                  </div>
                </div>
                <div className="group-card-list">
                  {(groupedRequirements.get(group) ?? []).map((requirementId) => (
                    <RequirementCard
                      key={requirementId}
                      language={language}
                      id={requirementId}
                      selected={selection[requirementId]}
                      onToggle={toggleRequirement}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="flow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="section-title">
            <span className="section-index">02</span>
            <div className="section-header-text">
              <h2>{language === 'es' ? 'Decision de arquitectura' : 'Architecture Decision'}</h2>
              <p>
                {language === 'es'
                  ? 'Resumen ejecutivo de la decision para cliente final.'
                  : 'Executive summary of the selected decision for client delivery.'}
              </p>
            </div>
          </div>

          <div className="decision-grid">
            <article className="decision-primary-card">
              <div className="decision-topline">
                <span className="profile-badge">{primaryProfile.id}</span>
                <span className="profile-kind">{primaryProfile.kind.toUpperCase()}</span>
              </div>
              <h3>{text(primaryProfile.title, language)}</h3>
              <p>{text(primaryProfile.summary, language)}</p>
              <div className="decision-meta">
                <div>
                  <strong>{language === 'es' ? 'Regla clave' : 'Key rule'}</strong>
                  <span>{text(primaryProfile.keyRule, language)}</span>
                </div>
                <div>
                  <strong>{language === 'es' ? 'Riesgo principal' : 'Main risk'}</strong>
                  <span>{text(primaryProfile.mainRisk, language)}</span>
                </div>
              </div>
              <div className="capability-chip-row">
                <span className="chips-label">{language === 'es' ? 'Necesidades activas' : 'Active needs'}</span>
                {activeNeeds.map((need) => (
                  <span key={need} className="capability-chip">
                    {need}
                  </span>
                ))}
              </div>
            </article>

            <aside className="decision-side-card">
              <h4>
                <ShieldCheck size={16} />
                {language === 'es' ? 'Contexto CIBMAQ' : 'CIBMAQ context'}
              </h4>
              <ul>
                <li>
                  <span>{language === 'es' ? 'Fuente' : 'Source'}</span>
                  <span>{primaryProfile.matrixTrace}</span>
                </li>
                <li>
                  <span>{language === 'es' ? 'OEM referencia' : 'OEM reference'}</span>
                  <span>{primaryProfile.oemReference ?? 'N/A'}</span>
                </li>
              </ul>
              <p className="decision-side-summary">{text(primaryProfile.executiveSummary, language)}</p>
            </aside>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
